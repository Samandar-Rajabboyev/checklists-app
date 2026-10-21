export const newId = () => crypto.randomUUID();

// The client generates ids (crypto.randomUUID) for goals/phases/tasks it
// creates optimistically, so follow-up edits can reference them before the
// create round-trip finishes. Accept a client id only if it looks sane;
// otherwise mint one server-side.
const CLIENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
export const pickId = (raw: unknown) =>
  typeof raw === "string" && CLIENT_ID_RE.test(raw) ? raw : newId();

export const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, (c) =>
    c === "+" ? "-" : c === "/" ? "_" : "",
  );
};
