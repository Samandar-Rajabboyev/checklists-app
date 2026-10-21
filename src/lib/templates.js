import { uid } from "./storage.js";

// Starter phases/tasks offered when creating a NEW goal. Picking one just
// seeds the editor — everything stays editable.
export const TEMPLATES = {
  software: {
    label: "Software project",
    emoji: "💻",
    phases: [
      { title: "Planning", tasks: ["Define scope & requirements", "Pick stack & tooling", "Set up repo & CI"] },
      { title: "Build", tasks: ["Implement core features", "Write tests", "Code review pass"] },
      { title: "Launch", tasks: ["Deploy to production", "Write docs / README", "Announce & gather feedback"] },
    ],
  },
  study: {
    label: "Study plan",
    emoji: "📚",
    phases: [
      { title: "Foundations", tasks: ["Gather materials / syllabus", "Skim overview & build a roadmap"] },
      { title: "Core learning", tasks: ["Work through main material", "Take notes & summarize each unit", "Do practice exercises"] },
      { title: "Review & assess", tasks: ["Take a practice test", "Review weak areas", "Final review session"] },
    ],
  },
  business: {
    label: "Business plan",
    emoji: "📈",
    phases: [
      { title: "Validate", tasks: ["Define target customer", "Talk to potential customers", "Validate pricing"] },
      { title: "Build", tasks: ["Build MVP / offer", "Set up basic operations", "Prepare launch assets"] },
      { title: "Grow", tasks: ["Launch to first customers", "Set up tracking / metrics", "Iterate on feedback"] },
    ],
  },
};

export const blankTask = (text = "", done = false) => ({
  id: uid(),
  text,
  tag: "",
  done,
  priority: "none",
  due_date: "",
});

// `label` "" means "auto" — the editor shows and saves `Phase <index>`.
export const blankPhase = (title = "") => ({ id: uid(), label: "", title, duration: "", tasks: [] });

export function buildPhasesFromTemplate(key) {
  const tpl = TEMPLATES[key];
  if (!tpl) return null;
  return tpl.phases.map((ph) => ({ ...blankPhase(ph.title), tasks: ph.tasks.map((t) => blankTask(t)) }));
}
