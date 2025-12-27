import parserMarkdown from "./mardownParser";
import sanitizeMarkdown from "./markdownSanitizer";

describe("Markdown & Security Utilities", () => {
  describe("parserMarkdown", () => {
    it("should render standard markdown to HTML", async () => {
      const markdown = "# Title\n**bold** and *italic*";
      const html = await parserMarkdown(markdown);
      expect(html).toContain("<h1>Title</h1>");
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain("em");
    });

    it("should convert YouTube embed syntax to an iframe", async () => {
      const markdown =
        "![Video](embed:https://www.youtube.com/watch?v=dQw4w9WgXcQ)";
      const html = await parserMarkdown(markdown);
      expect(html).toContain('<div class="video-container">');
      expect(html).toContain("<iframe");
      expect(html).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    });

    it("should return error message for unsupported YouTube URLs", async () => {
      const markdown = "![Video](embed:https://vimeo.com/12345)";
      const html = await parserMarkdown(markdown);
      expect(html).toContain("[Unsupported YouTube URL]");
    });
  });

  describe("sanitizeMarkdown", () => {
    it("should remove dangerous <script> tags", () => {
      const rawHtml = "<p>Hello</p><script>alert('xss')</script>";
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toBe("<p>Hello</p>");
      expect(cleanHtml).not.toContain("<script>");
    });

    it("should remove onerror attributes from images", () => {
      const rawHtml = '<img src="x" onerror="alert(1)">';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toContain('<img src="x"');
      expect(cleanHtml).not.toContain("onerror");
    });

    it("should allow safe iframes from YouTube", () => {
      const rawHtml =
        '<div class="video-container"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe></div>';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toContain('<div class="video-container">');
      expect(cleanHtml).toContain(
        '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ">'
      );
    });

    it("should strip malicious src from iframes", () => {
      const rawHtml = '<iframe src="https://malicious-site.com"></iframe>';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      // It might keep the <iframe> tag but must remove the src
      expect(cleanHtml).not.toContain("malicious-site.com");
      expect(cleanHtml).not.toContain('src="https://malicious-site.com"');
    });

    it("should allow safe HTML tags like <b> and <i>", () => {
      const rawHtml = "<b>Bold</b> and <i>Italic</i>";
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toContain("<b>Bold</b>");
      expect(cleanHtml).toContain("<i>Italic</i>");
    });
  });

  describe("Integrated Flow (Parse -> Sanitize)", () => {
    it("should securely handle a complex malicious markdown input", async () => {
      const maliciousMarkdown =
        "# Title\n" +
        "![Video](embed:https://www.youtube.com/watch?v=12345678901)\n" +
        "<script>console.log('hacked')</script>\n" +
        "<img src=x onerror=alert(1)>";

      const parsed = await parserMarkdown(maliciousMarkdown);
      const sanitized = sanitizeMarkdown(parsed);

      expect(sanitized).toContain("<h1>Title</h1>");
      expect(sanitized).toContain("iframe");
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("onerror");
    });
  });
});
