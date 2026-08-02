"use client";

import { useState } from "react";
import { Play, Pause, Download, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceholderArt } from "@/components/shared/PlaceholderArt";

export interface MediaInfo {
  title: string;
  subtitle?: string;
  duration?: string;
  /** "video" muestra una portada; "audio" muestra una onda. */
  kind: "video" | "audio";
  meta?: string;
  actions?: boolean;
}

/** Onda dibujada por CSS — no hay audio real todavía, es una vista previa. */
function Waveform({ playing }: { playing: boolean }) {
  const bars = Array.from({ length: 56 }, (_, i) => 20 + Math.abs(Math.sin(i * 0.7)) * 70);
  return (
    <div className="flex h-10 flex-1 items-center gap-[2px] overflow-hidden">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] flex-shrink-0 rounded-full transition-colors ${
            playing && i < bars.length / 3 ? "bg-[var(--allpa-gold-400)]" : "bg-white/20"
          }`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function MediaPreview({ media }: { media: MediaInfo }) {
  const [playing, setPlaying] = useState(false);

  if (media.kind === "video") {
    return (
      <div>
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <PlaceholderArt seed={3} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <p className="max-w-[70%] font-serif text-lg font-semibold leading-tight text-white drop-shadow">{media.title}</p>
            {media.subtitle && <p className="text-xs text-white/70">{media.subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--allpa-gold-400)] text-[#241a05] shadow-lg transition-transform hover:scale-105"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
        </div>
        {media.meta && <p className="mt-2 text-xs text-white/35">{media.meta}</p>}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 truncate text-sm text-white/80">{media.title}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pausar" : "Reproducir"}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--allpa-gold-400)] text-[#241a05] transition-transform hover:scale-105"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <Waveform playing={playing} />
        {media.duration && <span className="flex-shrink-0 text-xs tabular-nums text-white/50">{media.duration}</span>}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {media.meta && <p className="text-xs text-white/35">{media.meta}</p>}
        {media.actions && (
          <span className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Descargar
            </Button>
            <Button variant="outline" size="sm" className="h-8 border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
              <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
              Reemplazar
            </Button>
          </span>
        )}
      </div>
    </div>
  );
}
