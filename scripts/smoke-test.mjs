// End-to-end API smoke test against a running `wrangler dev` with
// DEV_LOGIN=1 (see .dev.vars.example). Usage:
//   npm run build && npm run worker:dev     # in one terminal
//   npm run smoke                           # in another
// Exits non-zero on the first failed check.

const BASE = process.env.BASE_URL || "http://localhost:8787";
let cookie = "";

function check(cond, msg) {
  if (!cond) {
    console.error(`✗ ${msg}`);
    process.exit(1);
  }
  console.log(`✓ ${msg}`);
}

async function call(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    redirect: "manual",
    headers: { "Content-Type": "application/json", cookie, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) if (c.startsWith("session=")) cookie = c.split(";")[0];
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text, headers: res.headers };
}

const nav = { "Sec-Fetch-Mode": "navigate", Accept: "text/html" };

// Routing: browser navigations to /api/* must reach the Worker, not the SPA.
let r = await call("GET", "/api/auth/github", null, nav);
check(r.status === 302 && r.headers.get("location")?.includes("github.com"), "navigation to /api/auth/github redirects to GitHub");
r = await call("GET", "/some/spa/route", null, nav);
check(r.status === 200 && r.text.includes("<div id=\"root\">"), "SPA fallback still serves index.html");

r = await call("GET", "/api/auth/me");
check(r.json?.user === null, "signed out by default");
r = await call("GET", "/api/goals");
check(r.status === 401, "goals require auth");

r = await call("GET", "/api/auth/dev", null, nav);
check(r.status === 302 && cookie, "dev login sets a session cookie");
r = await call("GET", "/api/auth/me");
check(r.json?.user?.name === "Dev User", "me returns the dev user");

const goalId = crypto.randomUUID();
const [p1, p2] = [crypto.randomUUID(), crypto.randomUUID()];
const [t1, t2, t3] = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
r = await call("POST", "/api/goals", {
  id: goalId,
  title: "Smoke test goal",
  category: "software",
  phases: [
    { id: p1, label: "Phase 0", tasks: [{ id: t1, text: "one" }, { id: t2, text: "two", done: true }] },
    { id: p2, label: "Phase 1", tasks: [{ id: t3, text: "three", priority: "high" }] },
  ],
});
check(r.status === 201 && r.json.goal.id === goalId, "create goal keeps client id");
check(r.json.goal.phases[0].tasks[1].done === 1, "create goal keeps task done state");

// Move t1 into phase 2 (after t3) and swap phase order.
r = await call("PUT", `/api/goals/${goalId}/order`, {
  phases: [
    { id: p2, tasks: [t3, t1] },
    { id: p1, tasks: [t2] },
  ],
});
const ph = r.json.goal.phases;
check(ph[0].id === p2 && ph[0].tasks.map((t) => t.id).join() === [t3, t1].join(), "reorder moves task across phases and reorders phases");

r = await call("PATCH", `/api/goals/${goalId}/tasks/${t3}`, { done: true, due_date: "" });
check(r.json.goal.phases[0].tasks[0].done === 1 && r.json.goal.phases[0].tasks[0].due_date === null, "task update normalizes empty due date");

const t4 = crypto.randomUUID();
r = await call("POST", `/api/goals/${goalId}/phases/${p1}/tasks`, { id: t4, text: "four" });
check(r.json.goal.phases[1].tasks.some((t) => t.id === t4), "add task keeps client id");

r = await call("PATCH", `/api/goals/${goalId}`, { status: "archived" });
check(r.json.goal.status === "archived", "archive goal");

r = await call("GET", "/api/goals");
const summary = r.json.goals.find((g) => g.id === goalId);
check(summary && summary.task_count === 4 && summary.task_done_count === 2, "list returns task counts");

r = await call("POST", "/api/import", { checklists: [{ title: "Imported", phases: [{ label: "P", tasks: [{ text: "x", done: true }] }] }] });
check(r.json?.imported === 1, "import endpoint");

r = await call("DELETE", `/api/goals/${goalId}`);
check(r.json?.ok, "delete goal");

r = await call("POST", "/api/auth/logout");
r = await call("GET", "/api/auth/me");
check(r.json?.user === null, "logout clears the session");

console.log("\nall checks passed");
