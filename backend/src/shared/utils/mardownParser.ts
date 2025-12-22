import { marked } from "marked";

const youtubeRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const renderer = new marked.Renderer();

// Custom image renderer to handle "embed:" syntax for YouTube videos
renderer.image = ({
  href,
  title,
  text,
}: {
  href: string;
  title: string | null;
  text: string;
}) => {
  if (href && href.startsWith("embed:")) {
    const rawUrl = href.substring(6);
    const match = rawUrl.match(youtubeRegex);

    if (match && match[4]) {
      const videoId = match[4];
      // Render responsive iframe
      return `<div class="video-container">
                <iframe 
                  src="https://www.youtube.com/embed/${videoId}" 
                  title="${text || "YouTube video"}"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
              </div>`;
    }
    return '<p style="color:red">[Unsupported YouTube URL]</p>';
  }

  // Fallback to default image rendering for standard images
  return `<img src="${href}" alt="${text}" title="${title || ""}" />`;
};

const parserMarkdown = (markdown: string) => {
  // Cast to string as we are using it synchronously
  return marked(markdown, { renderer }) as string;
};

export default parserMarkdown;
