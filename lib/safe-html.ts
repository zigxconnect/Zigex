import sanitizeHtml from "sanitize-html";

/**
 * Clean HTML written by companies or admins (rich-text descriptions,
 * announcements) before it's put on the page: formatting, links, lists and
 * images stay; scripts, event handlers, styles and `javascript:` links go.
 * Works on the server and in the browser.
 */
export function safeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup", "small", "span",
      "ul", "ol", "li", "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    // Links leave the site in a new tab without handing it a reference to this one.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
      }),
    },
  });
}
