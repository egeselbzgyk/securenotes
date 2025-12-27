import { passwordService } from "./auth/password.service";
import sanitizeMarkdown from "./shared/utils/markdownSanitizer";
import parserMarkdown from "./shared/utils/mardownParser";
import { createRateLimiter } from "./shared/middlewares/rateLimit";

describe("Security Tests", () => {
  describe("Password Strength Validation", () => {
    it("should accept strong password", () => {
      expect(() => {
        passwordService.assertStrong("StrongP@ssw0rd!", { userInputs: [] });
      }).not.toThrow();
    });

    it("should reject weak password with low entropy", () => {
      expect(() => {
        passwordService.assertStrong("password123", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject very weak password", () => {
      expect(() => {
        passwordService.assertStrong("12345678", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password containing username", () => {
      expect(() => {
        passwordService.assertStrong("Username123!", {
          userInputs: ["username"],
        });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password containing email", () => {
      expect(() => {
        passwordService.assertStrong("Example123!", {
          userInputs: ["user@example.com"],
        });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password with common pattern", () => {
      expect(() => {
        passwordService.assertStrong("Password123!", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password with sequential characters", () => {
      expect(() => {
        passwordService.assertStrong("Abcdef12!", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password with repeated patterns", () => {
      expect(() => {
        passwordService.assertStrong("aaaaaa111!!", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password with common words", () => {
      expect(() => {
        passwordService.assertStrong("iloveyou123!", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });
  });

  describe("XSS Prevention", () => {
    it("should sanitize script tags", () => {
      const malicious = "<script>alert('xss')</script>";
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("alert('xss')");
    });

    it("should sanitize onerror attributes", () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain("onerror");
    });

    it("should sanitize onclick attributes", () => {
      const malicious = '<button onclick="alert(1)">Click</button>';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain("onclick");
    });

    it("should sanitize javascript: protocol", () => {
      const malicious = '<a href="javascript:alert(1)">Click</a>';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain("javascript:");
    });

    it("should sanitize data-* attributes that could be used for XSS", () => {
      const malicious = '<div data-x="alert(1)">Content</div>';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain("data-x");
    });

    it("should sanitize iframe with javascript src", () => {
      const malicious = '<iframe src="javascript:alert(1)"></iframe>';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain("javascript:");
    });

    it("should allow safe YouTube iframes", () => {
      const safe =
        '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>';
      const sanitized = sanitizeMarkdown(safe);
      expect(sanitized).toContain("youtube.com");
      expect(sanitized).toContain("iframe");
    });

    it("should reject iframes from non-whitelisted domains", () => {
      const malicious = '<iframe src="https://malicious-site.com"></iframe>';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain("malicious-site.com");
    });

    it("should handle script tags in markdown", async () => {
      const malicious = "# Title\n" + "<script>alert('xss')</script>";

      const parsed = await parserMarkdown(malicious);
      const sanitized = sanitizeMarkdown(parsed);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("<h1>Title</h1>");
    });
  });

  describe("Rate Limiting Configuration", () => {
    it("should create rate limiter with correct configuration", () => {
      const limiter = createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
      });

      expect(limiter).toBeDefined();
    });

    it("should create strict rate limiter for auth endpoints", () => {
      const strictLimiter = createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        max: 10,
      });

      expect(strictLimiter).toBeDefined();
    });
  });

  describe("Password Hashing Security", () => {
    it("should use argon2id algorithm", async () => {
      const password = "TestPassword123!";
      const hash = await passwordService.hash(password);

      // Argon2id hashes start with $argon2id$
      expect(hash).toMatch(/^\$argon2id\$/);
    });

    it("should produce different hashes for same password", async () => {
      const password = "TestPassword123!";
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should verify password correctly", async () => {
      const password = "TestPassword123!";
      const hash = await passwordService.hash(password);

      const isValid = await passwordService.verify(hash, password);
      expect(isValid).toBe(true);
    });

    it("should reject wrong password", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword123!";
      const hash = await passwordService.hash(password);

      const isValid = await passwordService.verify(hash, wrongPassword);
      expect(isValid).toBe(false);
    });

    it("should use appropriate memory cost parameter", async () => {
      // Check that memory cost is set (should be 19456 as per code)
      const hash = await passwordService.hash("test");
      // Argon2id format: $argon2id$v=19$m=19456,t=2,p=1$...
      expect(hash).toMatch(/m=19456/);
    });

    it("should use appropriate time cost parameter", async () => {
      const hash = await passwordService.hash("test");
      // Argon2id format: $argon2id$v=19$m=19456,t=2,p=1$...
      expect(hash).toMatch(/t=2/);
    });

    it("should use appropriate parallelism parameter", async () => {
      const hash = await passwordService.hash("test");
      // Argon2id format: $argon2id$v=19$m=19456,t=2,p=1$...
      expect(hash).toMatch(/p=1/);
    });
  });

  describe("Markdown Parser Security", () => {
    it("should convert markdown to HTML safely", async () => {
      const markdown = "# Heading\n**bold** and *italic*";
      const html = await parserMarkdown(markdown);

      expect(html).toContain("<h1>Heading</h1>");
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain("<em>italic</em>");
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

    it("should reject non-YouTube URLs", async () => {
      const markdown = "![Video](embed:https://vimeo.com/12345)";
      const html = await parserMarkdown(markdown);

      expect(html).toContain("[Unsupported YouTube URL]");
    });

    it("should not convert regular images", async () => {
      const markdown = "![Alt text](image.jpg)";
      const html = await parserMarkdown(markdown);

      expect(html).toContain('<img src="image.jpg"');
      expect(html).toContain('alt="Alt text"');
    });
  });

  describe("Input Sanitization Integration", () => {
    it("should safely handle markdown with script tags after parsing", async () => {
      const maliciousInput = "# Hello\n" + "<script>alert('xss')</script>";

      const parsedHtml = await parserMarkdown(maliciousInput);
      const sanitizedHtml = sanitizeMarkdown(parsedHtml);

      expect(sanitizedHtml).toContain("<h1>Hello</h1>");
      expect(sanitizedHtml).not.toContain("<script>");
    });

    it("should preserve safe HTML tags", async () => {
      const safeInput = "# Title\n\n<b>Bold</b> and <i>italic</i>";
      const parsedHtml = await parserMarkdown(safeInput);
      const sanitizedHtml = sanitizeMarkdown(parsedHtml);

      expect(sanitizedHtml).toContain("<b>Bold</b>");
      expect(sanitizedHtml).toContain("<i>italic</i>");
    });
  });
});
