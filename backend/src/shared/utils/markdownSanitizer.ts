import sanitizeHtml from "sanitize-html";

const sanitizeMarkdown = (rawHtml: string) => {
  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "img",
      "iframe",
      "div",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "title", "target"],
      iframe: [
        "src",
        "title",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
        "sandbox",
      ],
      div: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "ftp"],
    allowedIframeHostnames: ["www.youtube.com", "youtu.be", "youtube.com"],
    // Transform function to remove dangerous attributes and iframes
    transformTags: {
      // Generic cleaner for all tags to remove data-* and event handlers
      "*": (tagName, attribs) => {
        const cleanAttribs: Record<string, string> = {};
        for (const key in attribs) {
          // Block data-* attributes
          if (key.startsWith("data-")) {
            continue;
          }
          // Block event handlers (onclick, onmouseover, etc.)
          if (key.toLowerCase().startsWith("on")) {
            continue;
          }
          cleanAttribs[key] = attribs[key];
        }
        return { tagName, attribs: cleanAttribs };
      },
      iframe: (tagName, attribs) => {
        // Remove iframes with javascript: src
        if (attribs.src && attribs.src.startsWith("javascript:")) {
          return { tagName: "", attribs: {} };
        }
        return { tagName, attribs };
      },
    },
  });
};

export default sanitizeMarkdown;
