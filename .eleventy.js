const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const katex = require("@iktakahiro/markdown-it-katex");
const cheerio = require("cheerio");

module.exports = function (eleventyConfig) {
  // Fonction pour créer des slugs français
  function slugify(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // ------------ Markdown avec LaTeX ET anchors ----------
  const mdLib = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(katex)
    .use(markdownItAnchor, {
      slugify: slugify,
      permalink: false,
    });

  eleventyConfig.setLibrary("md", mdLib);

  // ------------ table of contents ------------------
  eleventyConfig.addFilter("getTOC", function (content) {
    const $ = cheerio.load(content);
    let toc = "<div>";

    $("h1, h2, h3").each(function () {
      const text = $(this).text();
      const id = $(this).attr("id");

      if (id) {
        const level = this.name;
        toc += ` 
        <div>
          <p><a class="toc-${level}" href="#${id}">${text}</a></p>
        </div>`;
      }
    });

    toc += "</div>";
    return toc;
  });

  // ------------ ajout de collections --------
  eleventyConfig.addCollection("recentPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/reflexions/*.md")
      .reverse()
      .slice(0, 3);
  });

  eleventyConfig.addCollection("reflexionsPosts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/reflexions/*.md").reverse();
  });

  // ----------------- ajout de filtres ----------------
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return dateObj.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // --------------- Passthrough copies -------------
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/script");
  eleventyConfig.addPassthroughCopy("src/lightbox2-2.11.4");
  eleventyConfig.addPassthroughCopy({ "CNAME": "CNAME" });

  // ---------------- ignore files ----------------
  eleventyConfig.ignores.add("_site");
  eleventyConfig.ignores.add("src/_includes/_site/");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
