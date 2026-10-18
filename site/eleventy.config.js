import fs from "node:fs";
import path from "node:path";
import markdownIt from "markdown-it";

const md = markdownIt({ html: true, breaks: true, typographer: true });

// Turn a YouTube or Vimeo link into an embeddable player URL.
function embedUrl(url) {
  if (!url) return "";
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return url;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.ignores.add("src/content/**");
  eleventyConfig.addWatchTarget("src/content/");

  eleventyConfig.addFilter("md", (s) => md.render(s || ""));
  eleventyConfig.addFilter("mdInline", (s) => md.renderInline(s || ""));
  eleventyConfig.addFilter("embedUrl", embedUrl);
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("forPage", (items, page) => (items || []).filter((t) => t.page === page));

  // Prose blocks edited in the CMS: src/content/<name>.md -> {% prose "name" %}
  eleventyConfig.addShortcode("prose", (name) => {
    const raw = fs.readFileSync(path.join("src/content", `${name}.md`), "utf8");
    return md.render(raw.replace(/^---\r?\n(?:[\s\S]*?\r?\n)?---\r?\n/, ""));
  });

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
  };
}
