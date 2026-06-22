export default async function skillsTemplatePlugin() {
  return {
    name: "skills-template",
    description: "Loads repository guidance and shared skills from this template.",
    instructions:
      "Read AGENTS.md and use applicable skills from ./skills before performing matching workflows.",
  };
}
