import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { isPubliclyPublished } from "../utils/drafts";

export async function GET(context) {
  const posts = (await getCollection("posts"))
    .filter(isPubliclyPublished)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: "Sourcier — Blog",
    description:
      "Practical software engineering writing for people transitioning into tech, engineers growing in confidence, and teams improving engineering practice.",
    site: context.site,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    customData: [
      `<language>en-gb</language>`,
      `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml"/>`,
    ].join(""),
  });
}
