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
      ],
      div: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data", "tel", "ftp"],
    allowedIframeHostnames: ["www.youtube.com", "youtu.be", "youtube.com"],
  });
};

export default sanitizeMarkdown;
