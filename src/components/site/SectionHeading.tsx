import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, action, tone = "light", className }: Props) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={cn("eyebrow flex items-center gap-3", dark ? "text-gold" : "text-accent")}>
            <span className={cn("h-px w-8", dark ? "bg-gold" : "bg-accent")} />
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "mt-3 text-3xl font-semibold leading-tight sm:text-4xl",
            dark ? "text-deep-foreground" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-4 text-base leading-relaxed", dark ? "text-deep-muted" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
