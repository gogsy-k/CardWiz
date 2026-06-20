import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/*
 * Renders post markdown safely: NO rehype-raw → raw HTML stays disabled (XSS-safe),
 * and react-markdown's default URL transform strips javascript: links. External
 * links get rel="noopener noreferrer"; images are lazy-loaded.
 */
export default function PostBody({ content }: { content: string }) {
  return (
    <div className="prose-cw">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          img: ({ node, ...props }) => <img {...props} loading="lazy" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
