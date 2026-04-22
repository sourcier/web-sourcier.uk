export interface CourseOffer {
  slug: string;
  focus: string;
  title: string;
  teaser: string;
  summary: string;
  topics: string[];
  outcomes: string[];
}

export interface CourseBundle {
  title: string;
  summary: string;
  benefits: string[];
  audience: string[];
}

export const courseLaunchLabel = "Launching soon";

export const courseSupportOffer = {
  singleShort: "1:1 included",
  singleDetail: "Each individual course includes 1:1 support.",
  bundleShort: "1:1 included",
  bundleDetail: "The full bundle includes 1:1 support across the programme.",
  additionalSessionsDetail:
    "If you need more help, additional 1:1 sessions can be added.",
};

export const courseOffers: CourseOffer[] = [
  {
    slug: "web-foundations",
    focus: "HTML & CSS",
    title: "Web Foundations",
    teaser:
      "Semantic HTML, modern CSS, accessibility, and responsive layouts that hold up on real projects.",
    summary:
      "Learn how to build pages that are structured well, styled deliberately, and resilient across devices.",
    topics: [
      "Semantic HTML5 structure and content hierarchy",
      "Accessible markup, forms, tables, and progressive enhancement",
      "Modern CSS layout with Flexbox, Grid, and responsive design",
      "Design-system thinking with reusable styles and variables",
    ],
    outcomes: [
      "Write cleaner, more accessible HTML without leaning on div soup.",
      "Build responsive interfaces that still make sense when the layout changes.",
      "Understand the CSS patterns you will actually reuse on production work.",
    ],
  },
  {
    slug: "javascript-frontend",
    focus: "Frontend JavaScript",
    title: "JavaScript for Frontend",
    teaser:
      "JavaScript, the DOM, React, and data-driven UI patterns for building production-grade front ends.",
    summary:
      "Move from browser fundamentals to modern frontend architecture, state management, and testing.",
    topics: [
      "JavaScript fundamentals, the DOM, events, and asynchronous code",
      "HTTP, REST, GraphQL, and client-side data fetching",
      "React, hooks, forms, routing, and state management",
      "Testing, TypeScript, and modern frontend tooling",
    ],
    outcomes: [
      "Build interactive interfaces with a stronger mental model of what the browser is doing.",
      "Ship React applications with better state, data, and testing habits.",
      "Make frontend decisions with more confidence instead of following recipes blindly.",
    ],
  },
  {
    slug: "javascript-backend",
    focus: "Backend JavaScript",
    title: "JavaScript for Backend",
    teaser:
      "Node, Express, databases, authentication, and server-side patterns for secure web applications.",
    summary:
      "Learn the backend pieces that let modern web apps store data, protect users, and integrate with real services.",
    topics: [
      "Node.js, processes, modules, and environment management",
      "Express routing, middleware, validation, and API design",
      "MongoDB, PostgreSQL, Redis, and practical data modelling",
      "Authentication, authorization, third-party services, and serverless delivery",
    ],
    outcomes: [
      "Build backend services that do more than just return JSON.",
      "Understand how auth, secrets, and data design change production decisions.",
      "Add backend context to your frontend work or move confidently into full-stack projects.",
    ],
  },
  {
    slug: "devops-delivery",
    focus: "Delivery & DevOps",
    title: "DevOps and Delivery",
    teaser:
      "DNS, CI/CD, Docker, Kubernetes, and the deployment habits that turn code into running software.",
    summary:
      "Cover the delivery chain from domain setup and pipelines to containerization and production operations.",
    topics: [
      "DNS, domains, certificates, and the basics of production infrastructure",
      "CI/CD pipelines, automated checks, and deployment workflows",
      "Build optimization, observability, and environment management",
      "Docker, Kubernetes, rollback strategy, and scalable delivery",
    ],
    outcomes: [
      "Understand what happens after code leaves your editor.",
      "Containerize and deploy applications with fewer production surprises.",
      "Work more confidently with platform, infrastructure, and delivery concerns.",
    ],
  },
];

export const courseBundle: CourseBundle = {
  title: "Full Stack Developer Bundle",
  summary:
    "Four connected self-paced courses that help you build the judgment AI cannot replace: how to structure, debug, review, and ship real web products from semantic markup through deployment.",
  benefits: [
    "Take the whole bundle for end-to-end context instead of learning each layer in isolation.",
    "Start with one course to keep the cost of entry smaller, then add more only when you need them.",
    courseSupportOffer.singleDetail,
    courseSupportOffer.bundleDetail,
  ],
  audience: [
    "Career switchers who want a practical path into modern web development.",
    "Frontend engineers who want stronger backend and delivery context.",
    "Developers who want a clearer picture of how real web products are built and shipped.",
  ],
};
