// Turns pasted multi-line text into editor items so a list copied from
// notes/markdown/a doc becomes tasks in one go:
//   "# Heading" / "## Heading"  → a new phase titled "Heading"
//   "- [x] thing" / "[ ] thing" → task, done state kept
//   "- thing" "* thing" "1. thing" "• thing" → task (bullet stripped)
//   anything else               → task as-is
// Blank lines are skipped.
const HEADING = /^\s*#{1,6}\s+(.+)$/;
const CHECKBOX = /^\s*(?:[-*+•]\s+)?\[([ xX])\]\s*/;
const BULLET = /^\s*(?:[-*+•]|\d+[.)])\s+/;

export function parsePastedList(text) {
  const items = [];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const heading = raw.match(HEADING);
    if (heading) {
      items.push({ type: "phase", title: heading[1].trim() });
      continue;
    }
    const box = raw.match(CHECKBOX);
    if (box) {
      items.push({ type: "task", text: raw.slice(box[0].length).trim(), done: box[1] !== " " });
      continue;
    }
    items.push({ type: "task", text: raw.replace(BULLET, "").trim(), done: false });
  }
  return items.filter((it) => it.type === "phase" || it.text);
}
