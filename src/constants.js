// ──── Constants & Schemes ─────────────────────────────────────────────────────

export const ACCENT_COLORS = ["#D4522A", "#2A6DD4", "#2AA65A", "#8B2AD4", "#D4A22A"];

export const SCHEMES = [
  {
    id: "notion-dark",
    name: "Notion Dark",
    bg: "#191919",
    bgCard: "#202020",
    bgHover: "#282828",
    text: "#E6E6E4",
    textMuted: "#828280",
    textPlaceholder: "#484846",
    border: "#303030",
    borderStrong: "#E6E6E4",
    phaseBar: "#E6E6E4",
    phaseBarText: "#191919",
    hintBg: "#111111",
    hintText: "#626260",
    hintKey: "#E6E6E4",
    hintKeyBg: "#282828",
    hintKeyBorder: "#3C3C3C",
    modalKbdBg: "#282828",
    modalKbdBorder: "#3C3C3C",
    overlayBg: "rgba(0,0,0,0.55)",
    overlayBgHeavy: "rgba(0,0,0,0.75)",
    accent: "#E6E6E4",
  },
  {
    id: "notion-dark-warm",
    name: "Notion Dark Warm",
    bg: "#1E1C1A",
    bgCard: "#262422",
    bgHover: "#2E2C28",
    text: "#E8E4DE",
    textMuted: "#847E76",
    textPlaceholder: "#4A4640",
    border: "#323028",
    borderStrong: "#E8E4DE",
    phaseBar: "#E8E4DE",
    phaseBarText: "#1E1C1A",
    hintBg: "#141210",
    hintText: "#646058",
    hintKey: "#E8E4DE",
    hintKeyBg: "#2E2C28",
    hintKeyBorder: "#3E3C36",
    modalKbdBg: "#2E2C28",
    modalKbdBorder: "#3E3C36",
    overlayBg: "rgba(10,8,6,0.6)",
    overlayBgHeavy: "rgba(10,8,6,0.78)",
    accent: "#C8A86A",
  },
  {
    id: "notion-dark-cool",
    name: "Notion Dark Cool",
    bg: "#1A1C1E",
    bgCard: "#222426",
    bgHover: "#2A2C30",
    text: "#E2E4E8",
    textMuted: "#7E8288",
    textPlaceholder: "#464A50",
    border: "#2E3236",
    borderStrong: "#E2E4E8",
    phaseBar: "#E2E4E8",
    phaseBarText: "#1A1C1E",
    hintBg: "#121416",
    hintText: "#606468",
    hintKey: "#E2E4E8",
    hintKeyBg: "#2A2C30",
    hintKeyBorder: "#3A3E44",
    modalKbdBg: "#2A2C30",
    modalKbdBorder: "#3A3E44",
    overlayBg: "rgba(8,10,12,0.6)",
    overlayBgHeavy: "rgba(8,10,12,0.78)",
    accent: "#7EB8D4",
  },
  {
    id: "notion",
    name: "Notion",
    bg: "#FFFFFF",
    bgCard: "#FBFBFA",
    bgHover: "#F1F0EF",
    text: "#37352F",
    textMuted: "#9B9A97",
    textPlaceholder: "#C7C6C4",
    border: "#E9E9E7",
    borderStrong: "#37352F",
    phaseBar: "#37352F",
    phaseBarText: "#FFFFFF",
    hintBg: "#2F2F2F",
    hintText: "#888580",
    hintKey: "#FFFFFF",
    hintKeyBg: "#454545",
    hintKeyBorder: "#555555",
    modalKbdBg: "#F1F0EF",
    modalKbdBorder: "#DDDDDD",
    overlayBg: "rgba(55,53,47,0.4)",
    overlayBgHeavy: "rgba(55,53,47,0.65)",
    accent: "#37352F",
  },
  {
    id: "notion-warm",
    name: "Notion Warm",
    bg: "#FAF8F5",
    bgCard: "#FFFFFF",
    bgHover: "#F0EDE8",
    text: "#37332C",
    textMuted: "#9A9590",
    textPlaceholder: "#C4BFB8",
    border: "#E8E4DE",
    borderStrong: "#37332C",
    phaseBar: "#37332C",
    phaseBarText: "#FAF8F5",
    hintBg: "#2C2822",
    hintText: "#847E78",
    hintKey: "#FAF8F5",
    hintKeyBg: "#42403A",
    hintKeyBorder: "#545048",
    modalKbdBg: "#F0EDE8",
    modalKbdBorder: "#D8D4CE",
    overlayBg: "rgba(44,40,34,0.45)",
    overlayBgHeavy: "rgba(44,40,34,0.65)",
    accent: "#9A7A4A",
  },
];

export const applyScheme = (s) => {
  const r = document.documentElement.style;
  r.setProperty("--bg", s.bg);
  r.setProperty("--bg-card", s.bgCard);
  r.setProperty("--bg-hover", s.bgHover);
  r.setProperty("--text", s.text);
  r.setProperty("--text-muted", s.textMuted);
  r.setProperty("--text-placeholder", s.textPlaceholder);
  r.setProperty("--border", s.border);
  r.setProperty("--border-strong", s.borderStrong);
  r.setProperty("--phase-bar", s.phaseBar);
  r.setProperty("--phase-bar-text", s.phaseBarText);
  r.setProperty("--hint-bg", s.hintBg);
  r.setProperty("--hint-text", s.hintText);
  r.setProperty("--hint-key", s.hintKey);
  r.setProperty("--hint-key-bg", s.hintKeyBg);
  r.setProperty("--hint-key-border", s.hintKeyBorder);
  r.setProperty("--modal-kbd-bg", s.modalKbdBg);
  r.setProperty("--modal-kbd-border", s.modalKbdBorder);
  r.setProperty("--overlay-bg", s.overlayBg);
  r.setProperty("--overlay-bg-heavy", s.overlayBgHeavy);
  r.setProperty("--accent", s.accent);
};
