export interface PlannedArticleIdea {
  title: string;
  description: string;
}

export interface AudienceGuide {
  slug: string;
  href: string;
  title: string;
  summary: string;
  pageTitle: string;
  pageDescription: string;
  pageSubtitle: string;
  intro: string;
  whoItsFor: string[];
  whatYouWillGet: string[];
  currentPostIds: string[];
  plannedArticles: PlannedArticleIdea[];
  supportHref: string;
  supportLabel: string;
}

export const audienceGuides: AudienceGuide[] = [
  {
    slug: "transition-into-tech",
    href: "/guides/transition-into-tech",
    title: "Transitioning into tech",
    summary:
      "Clear explanations, practical examples, and guidance for moving from learning to shipping real software.",
    pageTitle: "Transitioning into tech",
    pageDescription:
      "A practical guide for people transitioning into tech and building the confidence to work on real software.",
    pageSubtitle:
      "A practical path for people changing careers and trying to move from tutorials to real-world software work.",
    intro:
      "This guide is for people who want more than a list of technologies to learn. It is about building context: how software projects fit together, how to make sense of trade-offs, and how to develop the judgment that helps you move from learning in isolation to contributing with confidence.",
    whoItsFor: [
      "Career changers exploring a first role in software engineering.",
      "Bootcamp graduates trying to bridge the gap between classroom projects and production work.",
      "Self-taught developers who want a clearer mental model of how modern web projects are built.",
    ],
    whatYouWillGet: [
      "Practical explanations that connect individual tools to the bigger delivery picture.",
      "Examples you can use to understand how real products are structured and shipped.",
      "A roadmap of published and planned topics aimed at reducing early-career guesswork.",
    ],
    currentPostIds: [
      "i-should-start-a-blog",
      "choosing-the-tech-stack",
      "how-this-blog-was-built",
    ],
    plannedArticles: [
      {
        title: "How to move from tutorials to portfolio projects",
        description:
          "A practical framework for choosing projects that prove useful engineering skills instead of just copying a course.",
      },
      {
        title: "How to read a codebase when you are new",
        description:
          "A step-by-step way to explore an unfamiliar project without getting lost in every file and folder.",
      },
      {
        title:
          "What employers are really looking for in engineers starting out",
        description:
          "The habits, signals, and evidence that matter more than memorising another list of interview questions.",
      },
    ],
    supportHref: "/contact",
    supportLabel: "Ask about career-transition support",
  },
  {
    slug: "engineering-career-growth",
    href: "/guides/engineering-career-growth",
    title: "Growing as an engineer",
    summary:
      "Advice for engineers who want stronger habits, better judgment, and more confidence at work.",
    pageTitle: "Growing as an engineer",
    pageDescription:
      "A practical guide for engineers who want to grow their judgment, communication, and technical confidence.",
    pageSubtitle:
      "A path for engineers who want to move from completing tasks to becoming trusted contributors with better judgment.",
    intro:
      "Career growth usually comes from stronger habits rather than louder self-promotion. This guide focuses on the engineering behaviors that compound over time: writing maintainable code, communicating trade-offs, learning how to own outcomes, and turning technical work into visible impact.",
    whoItsFor: [
      "Engineers building confidence in their role and trying to make better technical decisions.",
      "Developers taking on more ownership in delivery, communication, and collaboration.",
      "People in software roles who want practical examples of better engineering habits they can apply right away.",
    ],
    whatYouWillGet: [
      "Posts that help you sharpen judgment, not just pick up syntax or tooling tips.",
      "Examples of how to think about delivery, testing, trade-offs, and product context.",
      "A growing roadmap of articles focused on the real work of progressing as an engineer.",
    ],
    currentPostIds: [
      "playwright-e2e-testing-talk",
      "content-collections-astro",
      "share-post-clipboard",
    ],
    plannedArticles: [
      {
        title: "How to own a feature end to end",
        description:
          "From framing the work to handling edge cases, trade-offs, testing, and rollout without dropping the details.",
      },
      {
        title: "How to write pull requests that speed up review",
        description:
          "The structure, context, and decision notes that help reviewers move faster and trust your work sooner.",
      },
      {
        title: "How to communicate trade-offs as a growing engineer",
        description:
          "A practical way to explain technical decisions to teammates, leads, and stakeholders without overcomplicating them.",
      },
    ],
    supportHref: "/contact",
    supportLabel: "Ask about engineering growth",
  },
  {
    slug: "engineering-practice",
    href: "/guides/engineering-practice",
    title: "Improving engineering practice",
    summary:
      "Practical guidance for teams that want healthier delivery habits, clearer expectations, and better software outcomes.",
    pageTitle: "Improving engineering practice",
    pageDescription:
      "A practical guide for teams and companies that want stronger engineering practice, healthier delivery habits, and better software quality.",
    pageSubtitle:
      "A guide for teams that want stronger engineering practice without turning everything into process theatre.",
    intro:
      "Engineering practice does not have to mean bureaucracy. The real goal is to make teams easier to work in: clearer expectations, better reviews, healthier testing habits, more maintainable systems, and delivery practices that improve quality instead of slowing momentum.",
    whoItsFor: [
      "Teams that want more consistency in how they build, review, and ship software.",
      "Engineering leaders who need a pragmatic way to raise the bar without introducing unnecessary process.",
      "Companies looking for healthier technical habits around quality, delivery, and mentoring.",
    ],
    whatYouWillGet: [
      "Working examples of delivery, tooling, and engineering decisions that improve day-to-day execution.",
      "A practical lens on engineering practice, testing, review culture, and technical direction.",
      "A roadmap of future articles aimed at helping teams raise the bar in manageable steps.",
    ],
    currentPostIds: [
      "choosing-the-tech-stack",
      "scheduled-publishing-astro",
      "transactional-email-resend",
    ],
    plannedArticles: [
      {
        title: "A lightweight engineering practice playbook",
        description:
          "What to document, what to leave flexible, and how to make better engineering practice actually useful to a working team.",
      },
      {
        title: "What good code review looks like on a growing team",
        description:
          "How to make reviews clearer, kinder, and more effective without turning them into a blocker.",
      },
      {
        title: "How to introduce testing without freezing delivery",
        description:
          "A pragmatic way to improve confidence and coverage when a team is already moving fast.",
      },
    ],
    supportHref: "/contact#team-guidance",
    supportLabel: "Talk about your team",
  },
];

export function getAudienceGuide(slug: string): AudienceGuide | undefined {
  return audienceGuides.find((guide) => guide.slug === slug);
}
