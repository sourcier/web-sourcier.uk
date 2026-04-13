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
      "Writing on software engineering, architecture, technical leadership, and lessons learned from 20+ years in the craft.",
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
