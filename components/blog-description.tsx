import { parseBlogDescription } from "@/lib/blog-content";

type BlogDescriptionProps = {
  className?: string;
  description: string;
  paragraphClassName?: string;
};

export function BlogDescription({
  className,
  description,
  paragraphClassName,
}: BlogDescriptionProps) {
  const paragraphs = parseBlogDescription(description);
  const bodyClassName = className ? `blog-body ${className}` : "blog-body";
  const bodyParagraphClassName = paragraphClassName
    ? `blog-paragraph ${paragraphClassName}`
    : "blog-paragraph";

  return (
    <div className={bodyClassName}>
      {paragraphs.map((paragraph, index) => (
        <p className={bodyParagraphClassName} key={`${index}-${paragraph.length}`}>
          {paragraph.map((segment, segmentIndex) =>
            segment.type === "link" ? (
              <a
                className="blog-inline-link"
                href={segment.href}
                key={`${segment.href}-${segmentIndex}`}
                rel={
                  segment.isAffiliate
                    ? "noopener noreferrer sponsored nofollow"
                    : "noopener noreferrer nofollow"
                }
                target="_blank"
              >
                {segment.text}
              </a>
            ) : (
              <span key={`${segment.text.slice(0, 20)}-${segmentIndex}`}>
                {segment.text}
              </span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
