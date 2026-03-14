'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { HiddenGem } from '../../constants/hidden-gems';

type SurpriseScratchCardProps = {
  gem: HiddenGem;
};

function getTravelModeByDistance(distanceKm: number) {
  return distanceKm < 1 ? 'walking' : 'motorcycle';
}

function distanceFromDalatCenterKm(latitude: number, longitude: number) {
  const center = { latitude: 11.9404, longitude: 108.4583 };
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDelta = toRad(latitude - center.latitude);
  const lonDelta = toRad(longitude - center.longitude);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(toRad(center.latitude)) * Math.cos(toRad(latitude)) *
    Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function SurpriseScratchCard({ gem }: SurpriseScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = card.clientWidth;
    const height = card.clientHeight;

    canvas.width = Math.floor(width * devicePixelRatio);
    canvas.height = Math.floor(height * devicePixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#D4A5A5');
    gradient.addColorStop(1, '#C88E8E');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(255,255,255,0.9)';
    context.font = "600 14px 'Inter', sans-serif";
    context.textAlign = 'center';
    context.fillText('Cao nhe de mo bi mat toi nay', width / 2, height / 2 - 6);
    context.font = "400 12px 'Inter', sans-serif";
    context.fillText('Chuyen da toi chuan bi rieng cho em', width / 2, height / 2 + 14);
  }, [gem.id]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = canvas.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(x, y, 18, 0, Math.PI * 2);
    context.fill();

    if (isRevealed) return;

    const sampled = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentCount = 0;

    for (let index = 3; index < sampled.length; index += 4 * 16) {
      if (sampled[index] < 25) transparentCount += 1;
    }

    const revealRatio = transparentCount / (sampled.length / (4 * 16));
    if (revealRatio > 0.32) {
      setIsRevealed(true);
    }
  };

  const mode = getTravelModeByDistance(distanceFromDalatCenterKm(gem.latitude, gem.longitude));
  const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${gem.latitude},${gem.longitude}&travelmode=${mode}`;

  return (
    <div className="mt-3 rounded-2xl border border-[#D4A5A5]/45 bg-[#fff8f8] p-3">
      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[#A36464]">
        <Sparkles className="h-3.5 w-3.5" />
        Surprise card
      </p>

      <div ref={cardRef} className="relative mt-2 h-28 overflow-hidden rounded-xl border border-[#D4A5A5]/35 bg-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
          <p className="text-sm font-semibold text-[#4A4A4A]">{gem.name}</p>
          <p className="mt-1 text-xs text-[#4A4A4A]/75">{gem.subtitle}</p>
        </div>

        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair touch-none"
            onPointerDown={(event) => {
              isDrawingRef.current = true;
              scratchAt(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (!isDrawingRef.current) return;
              scratchAt(event.clientX, event.clientY);
            }}
            onPointerUp={() => {
              isDrawingRef.current = false;
            }}
            onPointerLeave={() => {
              isDrawingRef.current = false;
            }}
          />
        )}
      </div>

      {isRevealed && (
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center rounded-full border border-[#7A9D8C]/35 bg-white px-3 py-2 text-[11px] text-[#527061] transition hover:bg-[#f4fbf8]"
        >
          Dan duong bi mat · {mode === 'walking' ? 'Di bo' : 'Xe may'}
        </a>
      )}
    </div>
  );
}
