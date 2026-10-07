"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Minus, Plus, X } from "lucide-react";

const VIEW = 280; // crop area on screen, CSS px
const OUT = 1080; // saved photo, px square
const MAX_ZOOM = 4;

type Pos = { x: number; y: number };

/**
 * Frame a profile photo before it's uploaded: drag to move, zoom with the
 * slider, pinch or the mouse wheel. The circle is what everyone sees, so the
 * face can fill it and stay sharp even at 40px. Saves a 1080px square JPEG.
 */
export function PhotoCropDialog({
  file,
  onCancel,
  onDone,
}: {
  file: File | null;
  onCancel: () => void;
  onDone: (cropped: File) => Promise<void> | void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const pointers = useRef(new Map<number, Pos>());
  const gesture = useRef<{ start: Pos; pos: Pos; dist?: number; zoom?: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setSize(null);
    setZoom(1);
    setFailed(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const base = size ? VIEW / Math.min(size.w, size.h) : 1; // "cover" scale at zoom 1
  const scale = base * zoom;

  const clamp = useCallback(
    (p: Pos, s = scale): Pos => {
      if (!size) return p;
      const minX = VIEW - size.w * s;
      const minY = VIEW - size.h * s;
      return { x: Math.min(0, Math.max(minX, p.x)), y: Math.min(0, Math.max(minY, p.y)) };
    },
    [size, scale]
  );

  const onLoad = (img: HTMLImageElement) => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const s = VIEW / Math.min(w, h);
    setSize({ w, h });
    // Start centred; on portrait photos, nearer the top, where faces usually are.
    const y = h > w ? -(h * s - VIEW) * 0.2 : -(h * s - VIEW) / 2;
    setPos({ x: -(w * s - VIEW) / 2, y });
  };

  /** Zoom keeping the point under the crop's centre (or a given point) still. */
  const zoomTo = (next: number, around: Pos = { x: VIEW / 2, y: VIEW / 2 }) => {
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    const ns = base * z;
    const ix = (around.x - pos.x) / scale;
    const iy = (around.y - pos.y) / scale;
    setZoom(z);
    setPos(clamp({ x: around.x - ix * ns, y: around.y - iy * ns }, ns));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current =
      pts.length === 2
        ? { start: pts[0], pos, dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom }
        : { start: { x: e.clientX, y: e.clientY }, pos };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length === 2 && g.dist && g.zoom) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mid = { x: (pts[0].x + pts[1].x) / 2 - rect.left, y: (pts[0].y + pts[1].y) / 2 - rect.top };
      zoomTo((g.zoom * Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)) / g.dist, mid);
    } else if (pts.length === 1) {
      setPos(clamp({ x: g.pos.x + e.clientX - g.start.x, y: g.pos.y + e.clientY - g.start.y }));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    const rest = [...pointers.current.values()];
    gesture.current = rest.length === 1 ? { start: rest[0], pos } : null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 10;
    const moves: Record<string, Pos> = { ArrowLeft: { x: step, y: 0 }, ArrowRight: { x: -step, y: 0 }, ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step } };
    if (moves[e.key]) {
      e.preventDefault();
      setPos((p) => clamp({ x: p.x + moves[e.key].x, y: p.y + moves[e.key].y }));
    } else if (e.key === "+" || e.key === "=") zoomTo(zoom + 0.2);
    else if (e.key === "-") zoomTo(zoom - 0.2);
  };

  const save = async () => {
    if (!size || !file) return;
    setSaving(true);
    setFailed(false);
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      // Same crop in the photo's own pixels.
      const sx = -pos.x / scale;
      const sy = -pos.y / scale;
      const side = VIEW / scale;
      const k = bitmap.width / size.w; // in case the decoded size differs from the preview
      const out = Math.min(OUT, Math.round(side * k)); // never enlarge a small photo
      const canvas = document.createElement("canvas");
      canvas.width = out;
      canvas.height = out;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, out, out);
      ctx.drawImage(bitmap, sx * k, sy * k, side * k, side * k, 0, 0, out, out);
      bitmap.close();
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
      if (!blob) throw new Error("encode");
      await onDone(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={Boolean(file)} onOpenChange={(o) => !o && !saving && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#0B1B3F]/60" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-[101] mx-auto max-h-[92dvh] max-w-sm -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_24px_64px_-16px_rgba(11,27,63,0.45)] focus:outline-none sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-heading text-lg font-semibold text-[#0B1B3F]">Position your photo</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-[#4A5670]">Drag to move. Zoom so your face fills the circle.</Dialog.Description>
            </div>
            <Dialog.Close disabled={saving} aria-label="Cancel" className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div
            role="application"
            aria-label="Photo position. Use arrow keys to move, plus and minus to zoom."
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              zoomTo(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08), { x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            className="relative mx-auto mt-5 cursor-grab touch-none select-none overflow-hidden rounded-xl bg-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 active:cursor-grabbing"
            style={{ width: VIEW, height: VIEW }}
          >
            {src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                draggable={false}
                onLoad={(e) => onLoad(e.currentTarget)}
                className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left"
                style={size ? { width: size.w * scale, height: size.h * scale, transform: `translate(${pos.x}px, ${pos.y}px)` } : { visibility: "hidden" }}
              />
            )}
            {!size && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white/70" aria-hidden="true" />
              </span>
            )}
            {/* Dim what falls outside the circle */}
            <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(11,27,63,0.55)] outline outline-2 outline-white/90" aria-hidden="true" />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={() => zoomTo(zoom - 0.25)} aria-label="Zoom out" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF]">
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => zoomTo(Number(e.target.value))}
              aria-label="Zoom"
              className="h-2 flex-1 cursor-pointer accent-[#155DFC]"
            />
            <button type="button" onClick={() => zoomTo(zoom + 0.25)} aria-label="Zoom in" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF]">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {failed && (
            <p role="alert" className="mt-3 rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
              This photo couldn&apos;t be prepared. Try a different photo.
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={save}
              disabled={!size || saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-base font-semibold text-white hover:bg-[#0F3FB8] disabled:opacity-60 sm:flex-1"
            >
              {saving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
              {saving ? "Saving photo…" : "Save photo"}
            </button>
            <Dialog.Close
              disabled={saving}
              className="inline-flex h-12 items-center justify-center rounded-xl px-5 text-base font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF] sm:flex-1"
            >
              Cancel
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
