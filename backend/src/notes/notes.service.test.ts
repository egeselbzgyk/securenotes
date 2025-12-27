import sanitizeMarkdown from "../shared/utils/markdownSanitizer";
import parserMarkdown from "../shared/utils/mardownParser";

describe("NotesService - Unit Tests", () => {
  describe("Markdown Parsing", () => {
    it("should parse standard markdown to HTML", async () => {
      const markdown = "# Title\n**bold** and *italic*";
      const html = await parserMarkdown(markdown);
      expect(html).toContain("<h1>Title</h1>");
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain("em");
    });

    it("should convert YouTube embed syntax to iframe", async () => {
      const markdown =
        "![Video](embed:https://www.youtube.com/watch?v=dQw4w9WgXcQ)";
      const html = await parserMarkdown(markdown);
      expect(html).toContain('<div class="video-container">');
      expect(html).toContain("<iframe");
      expect(html).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    });

    it("should handle short YouTube URLs", async () => {
      const markdown = "![Video](embed:https://youtu.be/dQw4w9WgXcQ)";
      const html = await parserMarkdown(markdown);
      expect(html).toContain("youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should render unsupported YouTube URLs as error", async () => {
      const markdown = "![Video](embed:https://vimeo.com/12345)";
      const html = await parserMarkdown(markdown);
      expect(html).toContain("[Unsupported YouTube URL]");
    });

    it("should render standard images", async () => {
      const markdown = "![Alt text](image.jpg)";
      const html = await parserMarkdown(markdown);
      expect(html).toContain('<img src="image.jpg"');
      expect(html).toContain('alt="Alt text"');
    });
  });

  describe("HTML Sanitization", () => {
    it("should remove dangerous script tags", () => {
      const rawHtml = "<p>Hello</p><script>alert('xss')</script>";
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toBe("<p>Hello</p>");
      expect(cleanHtml).not.toContain("<script>");
    });

    it("should remove onerror attributes", () => {
      const rawHtml = '<img src="x" onerror="alert(1)">';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toContain('<img src="x"');
      expect(cleanHtml).not.toContain("onerror");
    });

    it("should remove onclick attributes", () => {
      const rawHtml = '<button onclick="alert(1)">Click</button>';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).not.toContain("onclick");
    });

    it("should remove javascript: protocol", () => {
      const rawHtml = '<a href="javascript:alert(1)">Click</a>';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).not.toContain("javascript:");
    });

    it("should allow safe YouTube iframes", () => {
      const rawHtml =
        '<div class="video-container"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe></div>';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toContain("youtube.com");
      expect(cleanHtml).toContain("iframe");
    });

    it("should block malicious iframe sources", () => {
      const rawHtml = '<iframe src="https://malicious-site.com"></iframe>';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).not.toContain("malicious-site.com");
    });

    it("should allow safe HTML tags", () => {
      const rawHtml = "<b>Bold</b> and <i>Italic</i>";
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).toContain("<b>Bold</b>");
      expect(cleanHtml).toContain("<i>Italic</i>");
    });

    it("should remove data-* attributes", () => {
      const rawHtml = '<div data-x="alert(1)">Content</div>';
      const cleanHtml = sanitizeMarkdown(rawHtml);
      expect(cleanHtml).not.toContain("data-x");
    });
  });

  describe("Integrated Flow (Parse + Sanitize)", () => {
    it("should securely handle malicious markdown input", async () => {
      const maliciousMarkdown =
        "# Title\n" +
        "![Video](embed:https://www.youtube.com/watch?v=12345678901)\n" +
        "<script>alert('hacked')</script>";

      const parsed = await parserMarkdown(maliciousMarkdown);
      const sanitized = sanitizeMarkdown(parsed);

      expect(sanitized).toContain("<h1>Title</h1>");
      expect(sanitized).toContain("iframe");
      expect(sanitized).not.toContain("<script>");
    });

    it("should preserve safe markdown content", async () => {
      const safeMarkdown =
        "# Hello\n" +
        "This is **bold** and *italic*\n" +
        "- List item 1\n" +
        "- List item 2";

      const parsed = await parserMarkdown(safeMarkdown);
      const sanitized = sanitizeMarkdown(parsed);

      expect(sanitized).toContain("<h1>Hello</h1>");
      expect(sanitized).toContain("<strong>bold</strong>");
      expect(sanitized).toContain("<em>italic</em>");
      expect(sanitized).toContain("<li>"); // List items
    });

    it("should handle combined markdown and XSS", async () => {
      const malicious = "# Title\n" + "<script>alert('xss')</script>";

      const parsed = await parserMarkdown(malicious);
      const sanitized = sanitizeMarkdown(parsed);

      expect(sanitized).toContain("<h1>Title</h1>");
      expect(sanitized).not.toContain("<script>");
    });
  });
});
