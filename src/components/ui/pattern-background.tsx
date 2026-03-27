import { useEffect, useRef, useState } from "react";

import {
  PATTERNS,
  ITEM_SHAPES,
  PATTERN_BACKGROUND_PRESETS,
  normalizeCanvasColor,
  renderPatternBackground,
  type ItemShape,
  type PatternBackgroundProps,
  type PatternKind,
} from "../../lib/pattern-engine";

export { PATTERNS, ITEM_SHAPES, PATTERN_BACKGROUND_PRESETS };
export type { ItemShape, PatternKind, PatternBackgroundProps };

export function PatternBackground({
  rows,
  itemsPerRow,
  aspectRatio = 1,
  gap = 6,
  rotation = 0,
  itemRotation = 0,
  minOpacity,
  maxOpacity,
  frequency,
  rowShift,
  phase,
  pattern,
  itemShape,
  glyphText = "A*7",
  randomSeed,
  radialFrequency,
  radialTwist,
  animationSpeed = 0.8,
  isAnimating = true,
  backgroundColor,
  foregroundColor,
  itemColor,
  enableShockwave = false,
  shockwave = null,
  shockwaves,
  theme = "dark",
  className,
}: PatternBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const [animatedPhaseOffset, setAnimatedPhaseOffset] = useState(0);
  const [graphicWidth, setGraphicWidth] = useState(0);

  const resolvedPhase = phase + animatedPhaseOffset;
  const resolvedBackgroundColor = normalizeCanvasColor(
    backgroundColor,
    theme === "dark" ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
  );
  const resolvedItemColor = normalizeCanvasColor(
    itemColor,
    theme === "dark" ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
  );
  const resolvedForegroundColor = normalizeCanvasColor(
    foregroundColor,
    resolvedItemColor,
  );

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setGraphicWidth(entry.contentRect.width);
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isAnimating) {
      previousTimeRef.current = null;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      return;
    }

    const animate = (time: number) => {
      const previousTime = previousTimeRef.current ?? time;
      const deltaSeconds = (time - previousTime) / 1000;

      previousTimeRef.current = time;
      setAnimatedPhaseOffset(
        (currentValue) => currentValue + deltaSeconds * animationSpeed,
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      previousTimeRef.current = null;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationSpeed, isAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    renderPatternBackground(canvas, {
      rows,
      itemsPerRow,
      gap,
      rotation,
      itemRotation,
      minOpacity,
      maxOpacity,
      frequency,
      rowShift,
      phase: resolvedPhase,
      pattern,
      glyphText,
      itemShape,
      randomSeed,
      radialFrequency,
      radialTwist,
      backgroundColor: resolvedBackgroundColor,
      foregroundColor: resolvedForegroundColor,
      itemColor: resolvedItemColor,
      enableShockwave,
      shockwave,
      shockwaves,
      graphicWidth,
      graphicHeight: graphicWidth / aspectRatio,
      now: Date.now(),
    });
  }, [
    rows,
    itemsPerRow,
    aspectRatio,
    gap,
    rotation,
    itemRotation,
    minOpacity,
    maxOpacity,
    frequency,
    rowShift,
    resolvedPhase,
    pattern,
    glyphText,
    itemShape,
    randomSeed,
    radialFrequency,
    radialTwist,
    resolvedBackgroundColor,
    resolvedForegroundColor,
    resolvedItemColor,
    enableShockwave,
    shockwave,
    shockwaves,
    graphicWidth,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <canvas
        ref={canvasRef}
        className="block h-auto w-full"
        aria-hidden="true"
      />
    </div>
  );
}
