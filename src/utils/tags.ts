export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const tagDescriptions: Record<string, string> = {
  analytics:
    "Tracking, measuring, and making sense of how people use the web — from basic page views to real user metrics.",
  astro:
    "Everything about building with Astro: content collections, islands architecture, SSG, and the surrounding ecosystem.",
  automation:
    "Scripts, workflows, and tooling that take the repetitive work off your plate.",
  blogging:
    "The craft and mechanics of running a blog — structure, workflow, tooling, and keeping the writing habit going.",
  devto:
    "Cross-posting to DEV.to, syndication strategies, and making the most of the platform.",
  dotfiles:
    "Shell configs, editor settings, and the art of making a new machine feel like home.",
  engineering:
    "Software engineering practice — architecture, trade-offs, and the thinking behind building things well.",
  frontend:
    "HTML, CSS, JavaScript, and everything that shapes what users actually see and interact with.",
  "learning-in-public":
    "Writing and sharing while you're still figuring things out — the messy, honest, valuable kind.",
  meta: "Posts about the blog itself: how it was built, why decisions were made, and what's changed.",
  netlify:
    "Deploying, hosting, and extending sites with Netlify — functions, forms, edge, and scheduled builds.",
  tooling:
    "Developer tools that sharpen the workflow: linters, formatters, bundlers, and the rest.",
  tutorial:
    "Step-by-step guides with working code, aimed at getting you from zero to done.",
  "web-development":
    "The broader practice of building for the web — spanning frontend, backend, and everything in between.",
  writing:
    "Reflections on writing itself: finding a voice, staying consistent, and communicating clearly.",
};
