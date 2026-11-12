import type { LucideIcon } from "lucide-react";
import type { ImageKey } from "@/lib/images";
import type { AgendaItem, Article, Notice, Testimonial } from "./site";

export type Block =
  | { type: "prose"; heading?: string; paragraphs: string[]; image?: ImageKey; caption?: string }
  | { type: "facts"; items: { value: string; label: string }[] }
  | {
      type: "features";
      heading?: string;
      intro?: string;
      columns?: 2 | 3;
      items: { icon: LucideIcon; title: string; text: string; meta?: string }[];
    }
  | { type: "list"; heading: string; intro?: string; style: "numbered" | "check"; items: string[] }
  | { type: "schedule"; heading: string; intro?: string; items: { time: string; title: string; text?: string }[] }
  | { type: "steps"; heading: string; items: { title: string; text: string }[] }
  | {
      type: "table";
      heading: string;
      intro?: string;
      columns: string[];
      rows: string[][];
      note?: string;
      totalRow?: string[];
    }
  | { type: "people"; heading: string; intro?: string; items: { name: string; role: string }[] }
  | { type: "chain"; heading: string; intro?: string; items: { name: string; note: string }[] }
  | { type: "articles"; heading?: string; items: Article[]; showAuthor?: boolean }
  | { type: "agenda"; heading?: string; items: AgendaItem[] }
  | { type: "notices"; heading?: string; items: Notice[] }
  | { type: "quotes"; heading: string; items: Testimonial[] }
  | { type: "partners"; heading: string; intro?: string; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "psb-form" };

export type ContentPage = {
  title: string;
  summary: string;
  image: ImageKey;
  blocks: Block[];
};
