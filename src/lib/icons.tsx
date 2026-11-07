import {
  Save,
  Printer,
  Scissors,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  FolderOpen,
  FilePlus,
  ZoomIn,
  Highlighter,
  AlignCenter,
  SpellCheck,
  Image,
  Table,
  Link,
  Paintbrush,
  ListOrdered,
  Search,
  type LucideIcon,
} from "lucide-react";

export type ToolId =
  | "save"
  | "print"
  | "cut"
  | "copy"
  | "paste"
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "underline"
  | "open"
  | "new"
  | "zoom"
  | "highlight"
  | "center"
  | "spell"
  | "image"
  | "table"
  | "link"
  | "painter"
  | "list"
  | "find";

export interface ToolInfo {
  id: ToolId;
  name: string;
  Icon: LucideIcon;
  tip: string;
  color: string;
  looksLike: string;
}

export const TOOLS: Record<ToolId, ToolInfo> = {
  save: { id: "save", name: "Save", Icon: Save, tip: "Save (Ctrl+S) – keep your work safe", color: "#38bdf8", looksLike: "a floppy disk" },
  print: { id: "print", name: "Print", Icon: Printer, tip: "Print (Ctrl+P) – put your work on paper", color: "#a78bfa", looksLike: "a printer" },
  cut: { id: "cut", name: "Cut", Icon: Scissors, tip: "Cut (Ctrl+X) – remove and keep for pasting", color: "#f472b6", looksLike: "scissors" },
  copy: { id: "copy", name: "Copy", Icon: Copy, tip: "Copy (Ctrl+C) – make a copy", color: "#34d399", looksLike: "two overlapping pages" },
  paste: { id: "paste", name: "Paste", Icon: ClipboardPaste, tip: "Paste (Ctrl+V) – put it here", color: "#fbbf24", looksLike: "a clipboard" },
  undo: { id: "undo", name: "Undo", Icon: Undo2, tip: "Undo (Ctrl+Z) – go back one step", color: "#fb923c", looksLike: "a curved arrow pointing back" },
  redo: { id: "redo", name: "Redo", Icon: Redo2, tip: "Redo (Ctrl+Y) – do it again", color: "#22d3ee", looksLike: "a curved arrow pointing forward" },
  bold: { id: "bold", name: "Bold", Icon: Bold, tip: "Bold (Ctrl+B) – make text thick", color: "#f87171", looksLike: "a thick letter B" },
  italic: { id: "italic", name: "Italic", Icon: Italic, tip: "Italic (Ctrl+I) – make text lean", color: "#c084fc", looksLike: "a slanted letter I" },
  underline: { id: "underline", name: "Underline", Icon: Underline, tip: "Underline (Ctrl+U) – draw a line under text", color: "#4ade80", looksLike: "a U with a line" },
  open: { id: "open", name: "Open", Icon: FolderOpen, tip: "Open (Ctrl+O) – open a saved file", color: "#facc15", looksLike: "an open folder" },
  new: { id: "new", name: "New", Icon: FilePlus, tip: "New (Ctrl+N) – start a blank page", color: "#60a5fa", looksLike: "a page with a plus" },
  zoom: { id: "zoom", name: "Zoom", Icon: ZoomIn, tip: "Zoom In – make the page look bigger", color: "#2dd4bf", looksLike: "a magnifying glass" },
  highlight: { id: "highlight", name: "Highlight", Icon: Highlighter, tip: "Text Highlight – colour behind text like a marker pen", color: "#fde047", looksLike: "a marker pen" },
  center: { id: "center", name: "Center", Icon: AlignCenter, tip: "Center – put text in the middle", color: "#818cf8", looksLike: "lines in the middle" },
  spell: { id: "spell", name: "Spelling", Icon: SpellCheck, tip: "Spelling & Grammar – check your spelling", color: "#f472b6", looksLike: "ABC with a tick" },
  image: { id: "image", name: "Picture", Icon: Image, tip: "Insert Picture – add a photo", color: "#34d399", looksLike: "a mountain picture" },
  table: { id: "table", name: "Table", Icon: Table, tip: "Insert Table – add rows and columns", color: "#fb923c", looksLike: "a grid" },
  link: { id: "link", name: "Link", Icon: Link, tip: "Insert Link – connect to a website", color: "#38bdf8", looksLike: "chain links" },
  painter: { id: "painter", name: "Format Painter", Icon: Paintbrush, tip: "Format Painter – copy the style of text", color: "#e879f9", looksLike: "a paintbrush" },
  list: { id: "list", name: "Numbering", Icon: ListOrdered, tip: "Numbering – make a numbered list", color: "#a3e635", looksLike: "a numbered list" },
  find: { id: "find", name: "Find", Icon: Search, tip: "Find (Ctrl+F) – search for words", color: "#fbbf24", looksLike: "a magnifying glass" },
};

export function ToolIcon({ id, size = 28, className = "" }: { id: ToolId; size?: number; className?: string }) {
  const T = TOOLS[id];
  return <T.Icon size={size} strokeWidth={2.4} className={className} />;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
