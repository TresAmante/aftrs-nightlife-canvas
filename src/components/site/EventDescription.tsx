import { cn } from "@/lib/utils";

/** Renders admin-entered event text: blank lines split paragraphs,
 *  single line breaks are preserved, and `-`/`•` prefixed lines become a list. */
export function EventDescription({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.length > 0 && lines.every((l) => /^[-•]\s+/.test(l.trim()));

        if (isList) {
          return (
            <ul key={i} className="space-y-2">
              {lines.map((line, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-soft" />
                  <span>{line.replace(/^[-•]\s+/, "").trim()}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
