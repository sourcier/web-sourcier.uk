import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { isPublished } from "../utils/drafts";

export async function GET(context) {
  const posts = (await getCollection("posts"))
    .filter(isPublished)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: "Sourcier — Blog",
    description:
      "Practical software engineering writing for people transitioning into tech, engineers growing in confidence, and teams improving engineering practice.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-gb</language>`,
  });
}
