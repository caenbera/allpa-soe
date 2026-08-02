import { FileText, FileSpreadsheet, FileImage, FileVideo, FileAudio, Folder, File, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FileKind = "doc" | "sheet" | "pdf" | "image" | "video" | "audio" | "folder" | "other";

export interface FileEntry {
  id: string;
  name: string;
  kind: FileKind;
  meta: string;
  tag?: string;
}

const KIND_STYLE: Record<FileKind, { icon: LucideIcon; className: string }> = {
  doc: { icon: FileText, className: "bg-blue-400/12 text-blue-300" },
  sheet: { icon: FileSpreadsheet, className: "bg-emerald-400/12 text-emerald-300" },
  pdf: { icon: FileText, className: "bg-rose-400/12 text-rose-300" },
  image: { icon: FileImage, className: "bg-violet-400/12 text-violet-300" },
  video: { icon: FileVideo, className: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]" },
  audio: { icon: FileAudio, className: "bg-amber-400/12 text-amber-300" },
  folder: { icon: Folder, className: "bg-amber-400/12 text-amber-300" },
  other: { icon: File, className: "bg-white/8 text-white/50" },
};

export function FileList({ files, downloadable = false }: { files: FileEntry[]; downloadable?: boolean }) {
  return (
    <ul className="space-y-2.5">
      {files.map((file) => {
        const style = KIND_STYLE[file.kind];
        const Icon = style.icon;
        return (
          <li key={file.id} className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${style.className}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="min-w-0 truncate text-sm text-white/80">{file.name}</span>
                {file.tag && (
                  <span className="flex-shrink-0 rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] text-white/50">{file.tag}</span>
                )}
              </span>
              <span className="block truncate text-xs text-white/35">{file.meta}</span>
            </span>
            {downloadable && (
              <button
                type="button"
                aria-label={`Descargar ${file.name}`}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
