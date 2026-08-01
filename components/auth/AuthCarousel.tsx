"use client";

import { useCallback, useEffect, useState } from "react";
import { PlaceholderArt } from "@/components/shared/PlaceholderArt";
import { authCarouselSlides } from "@/lib/brand";
import Image from "next/image";

const INTERVAL = 6000;

export function AuthCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 350);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      goTo((current + 1) % authCarouselSlides.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [current, paused, goTo]);

  const slide = authCarouselSlides[current];

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden bg-[#06070c]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: fading ? 0 : 1 }}>
        {slide.image ? (
          <Image src={slide.image} alt="" fill className="object-cover" priority={current === 0} />
        ) : (
          <PlaceholderArt seed={current} className="h-full w-full" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

      <div className="relative z-10 flex h-full flex-col justify-end p-14">
        <div className="divider-gold mb-6" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#eec469]">{slide.eyebrow}</p>
        <h2 className="mb-4 max-w-md font-serif text-4xl font-semibold leading-tight text-white">{slide.title}</h2>
        <p className="max-w-sm text-sm leading-relaxed text-white/70">{slide.description}</p>

        <div className="mt-10 flex gap-2">
          {authCarouselSlides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 28 : 8,
                background: i === current ? "#eec469" : "rgba(255,255,255,0.28)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
