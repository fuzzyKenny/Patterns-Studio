import { motion } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import { hexToRgb, toRgbaString } from "../lib/color";
import {
  ITEM_SHAPES,
  PATTERNS,
  PATTERN_BACKGROUND_PRESETS,
  PatternBackground,
  type ItemShape,
  type PatternKind,
} from "./ui/pattern-background";

type RangeRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
};

type SelectRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{
    label: string;
    value: string;
  }>;
};

type TextRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const GLYPH_PRESETS = [
  { label: "Letters", value: "AER" },
  { label: "Symbols", value: "*#@+" },
  { label: "Numbers", value: "0123456789" },
  { label: "Mixed", value: "A*7#9" },
  { label: "Matrix", value: "$matrix" },
] as const;

function InspectorSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/8 px-5 py-5 first:border-t-0 first:pt-0">
      <div className="mb-4">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.24em] text-white/36">
          {title}
        </p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RowShell({ children }: { children: ReactNode }) {
  return <div className="py-1">{children}</div>;
}

function RangeRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (nextValue) => nextValue.toString(),
}: RangeRowProps) {
  const progress = ((value - min) / Math.max(max - min, 1)) * 100;

  return (
    <RowShell>
      <div className="grid grid-cols-[minmax(0,1fr)_1fr_auto] items-center gap-4">
        <span className="text-[0.98rem] text-white/82">{label}</span>
        <div className="relative h-6">
          <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 bg-white/10" />
          <motion.div
            className="absolute left-0 top-1/2 h-[6px] -translate-y-1/2 bg-white/18"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          />
          <motion.div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            animate={{ left: `${progress}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          />
          <motion.input
            whileTap={{ scale: 1.01 }}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
          />
        </div>
        <span className="min-w-10 text-right font-mono text-xs text-white/46">
          {formatValue(value)}
        </span>
      </div>
    </RowShell>
  );
}

function SelectRow({ label, value, onChange, options }: SelectRowProps) {
  return (
    <RowShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <span className="text-[0.98rem] text-white/82">{label}</span>
        <motion.select
          whileFocus={{ scale: 1.01 }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="studio-select min-w-[9.75rem]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </motion.select>
      </div>
    </RowShell>
  );
}

function TextRow({ label, value, onChange, placeholder }: TextRowProps) {
  return (
    <RowShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <span className="text-[0.98rem] text-white/82">{label}</span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="studio-input min-w-[11.5rem]"
        />
      </div>
    </RowShell>
  );
}

export function PatternStudio() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState(PATTERN_BACKGROUND_PRESETS.demo.rows);
  const [itemsPerRow, setItemsPerRow] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.itemsPerRow,
  );
  const [gap, setGap] = useState(PATTERN_BACKGROUND_PRESETS.demo.gap ?? 6);
  const [rotation, setRotation] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.rotation ?? 0,
  );
  const [itemRotation, setItemRotation] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.itemRotation ?? 0,
  );
  const [minOpacity, setMinOpacity] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.minOpacity,
  );
  const [maxOpacity, setMaxOpacity] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.maxOpacity,
  );
  const [frequency, setFrequency] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.frequency,
  );
  const [rowShift, setRowShift] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.rowShift,
  );
  const [phase, setPhase] = useState(PATTERN_BACKGROUND_PRESETS.demo.phase);
  const [pattern, setPattern] = useState<PatternKind>(
    PATTERN_BACKGROUND_PRESETS.demo.pattern,
  );
  const [itemShape, setItemShape] = useState<ItemShape>(
    PATTERN_BACKGROUND_PRESETS.demo.itemShape,
  );
  const [glyphText, setGlyphText] = useState("");
  const [radialFrequency, setRadialFrequency] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.radialFrequency,
  );
  const [radialTwist, setRadialTwist] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.radialTwist,
  );
  const [randomSeed, setRandomSeed] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.randomSeed,
  );
  const [isAnimating, setIsAnimating] = useState(true);
  const [enableShockwave, setEnableShockwave] = useState(true);
  const [shockwaves, setShockwaves] = useState<
    Array<{
      key: number;
      x: number;
      y: number;
    }>
  >([]);
  const [animationSpeed, setAnimationSpeed] = useState(
    PATTERN_BACKGROUND_PRESETS.demo.animationSpeed,
  );
  const [backgroundHex, setBackgroundHex] = useState("#000000");
  const [backgroundAlpha, setBackgroundAlpha] = useState(1);
  const [foregroundHex, setForegroundHex] = useState("#ffffff");
  const [foregroundAlpha, setForegroundAlpha] = useState(1);

  const {
    red: backgroundRed,
    green: backgroundGreen,
    blue: backgroundBlue,
  } = hexToRgb(backgroundHex);
  const {
    red: foregroundRed,
    green: foregroundGreen,
    blue: foregroundBlue,
  } = hexToRgb(foregroundHex);

  const backgroundColor = toRgbaString(
    backgroundRed,
    backgroundGreen,
    backgroundBlue,
    backgroundAlpha,
  );
  const foregroundColor = toRgbaString(
    foregroundRed,
    foregroundGreen,
    foregroundBlue,
    foregroundAlpha,
  );

  function triggerPreviewShockwave(event: PointerEvent<HTMLDivElement>) {
    if (!enableShockwave) {
      return;
    }

    const rect = previewRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setShockwaves((currentShockwaves) => {
      const nextShockwave = {
        key: Date.now(),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      return [...currentShockwaves.slice(-7), nextShockwave];
    });
  }

  function handleGlyphPresetChange(value: string) {
    setGlyphText(value);

    if (value) {
      setItemShape("glyph");
    }
  }

  return (
    <section className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_22rem]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex min-h-0 flex-col overflow-hidden border-b border-white/10 xl:border-b-0 xl:border-r"
      >
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            ref={previewRef}
            onPointerDown={triggerPreviewShockwave}
            className="group relative z-10 w-full cursor-crosshair overflow-hidden border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.48)]"
          >
            <PatternBackground
              rows={rows}
              itemsPerRow={itemsPerRow}
              gap={gap}
              rotation={rotation}
              itemRotation={itemRotation}
              minOpacity={minOpacity}
              maxOpacity={maxOpacity}
              frequency={frequency}
              rowShift={rowShift}
              phase={phase}
              pattern={pattern}
              itemShape={itemShape}
              glyphText={glyphText}
              randomSeed={randomSeed}
              radialFrequency={radialFrequency}
              radialTwist={radialTwist}
              animationSpeed={animationSpeed}
              isAnimating={isAnimating}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              itemColor={foregroundColor}
              enableShockwave={enableShockwave}
              shockwaves={shockwaves}
              className="relative"
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.48, delay: 0.08, ease: "easeOut" }}
        className="flex min-h-0 flex-col overflow-hidden border-l border-white/10 bg-black"
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[1.35rem] leading-none text-white"
            >
              experiment
            </span>
            <h2 className="text-[1.55rem] font-semibold tracking-[-0.05em] text-white">
              Patten Lab
            </h2>
          </div>
        </div>
        <div className="studio-scroll min-h-0 flex-1 overflow-y-auto pt-3">
          <InspectorSection title="Pattern">
            <SelectRow
              label="Pattern"
              value={pattern}
              onChange={(value) => setPattern(value as PatternKind)}
              options={PATTERNS}
            />
            <SelectRow
              label="Item shape"
              value={itemShape}
              onChange={(value) => setItemShape(value as ItemShape)}
              options={ITEM_SHAPES}
            />
            <SelectRow
              label="Glyph preset"
              value={
                GLYPH_PRESETS.some((preset) => preset.value === glyphText)
                  ? glyphText
                  : ""
              }
              onChange={handleGlyphPresetChange}
              options={[{ label: "None", value: "" }, ...GLYPH_PRESETS]}
            />
            <TextRow
              label="Glyph characters"
              value={glyphText}
              onChange={setGlyphText}
              placeholder="A*7"
            />
          </InspectorSection>

          <InspectorSection title="Grid">
            <RangeRow
              label="Rows"
              value={rows}
              min={2}
              max={28}
              onChange={setRows}
            />
            <RangeRow
              label="Items per row"
              value={itemsPerRow}
              min={4}
              max={48}
              onChange={setItemsPerRow}
            />
            <RangeRow
              label="Gap"
              value={gap}
              min={0}
              max={20}
              step={0.5}
              onChange={setGap}
              formatValue={(value) => value.toFixed(1)}
            />
            <RangeRow
              label="Rotation"
              value={rotation}
              min={-180}
              max={180}
              onChange={setRotation}
              formatValue={(value) => `${value}deg`}
            />
            <RangeRow
              label="Item rotation"
              value={itemRotation}
              min={-180}
              max={180}
              onChange={setItemRotation}
              formatValue={(value) => `${value}deg`}
            />
            <RangeRow
              label="Random seed"
              value={randomSeed}
              min={0}
              max={100}
              onChange={setRandomSeed}
            />
          </InspectorSection>

          <InspectorSection title="Wave">
            <RangeRow
              label="Pattern frequency"
              value={frequency}
              min={0.1}
              max={2.4}
              step={0.01}
              onChange={setFrequency}
              formatValue={(value) => value.toFixed(2)}
            />
            <RangeRow
              label="Row shift"
              value={rowShift}
              min={0}
              max={2.4}
              step={0.01}
              onChange={setRowShift}
              formatValue={(value) => value.toFixed(2)}
            />
            <RangeRow
              label="Phase"
              value={phase}
              min={0}
              max={6.28}
              step={0.01}
              onChange={setPhase}
              formatValue={(value) => value.toFixed(2)}
            />
            <RangeRow
              label="Radial frequency"
              value={radialFrequency}
              min={1}
              max={24}
              onChange={setRadialFrequency}
            />
            <RangeRow
              label="Radial twist"
              value={radialTwist}
              min={0.5}
              max={12}
              step={0.1}
              onChange={setRadialTwist}
              formatValue={(value) => value.toFixed(1)}
            />
            <RangeRow
              label="Animation speed"
              value={animationSpeed}
              min={0.1}
              max={3}
              step={0.01}
              onChange={setAnimationSpeed}
              formatValue={(value) => `${value.toFixed(2)}x`}
            />
          </InspectorSection>

          <InspectorSection title="Intensity">
            <RangeRow
              label="Min opacity"
              value={minOpacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) =>
                setMinOpacity(Math.min(value, maxOpacity - 0.01))
              }
              formatValue={(value) => `${Math.round(value * 100)}%`}
            />
            <RangeRow
              label="Max opacity"
              value={maxOpacity}
              min={0.05}
              max={1}
              step={0.01}
              onChange={(value) =>
                setMaxOpacity(Math.max(value, minOpacity + 0.01))
              }
              formatValue={(value) => `${Math.round(value * 100)}%`}
            />
          </InspectorSection>

          <InspectorSection title="Color">
            <TextRow
              label="Background hex"
              value={backgroundHex}
              onChange={setBackgroundHex}
              placeholder="#000000"
            />
            <RangeRow
              label="Background alpha"
              value={backgroundAlpha}
              min={0}
              max={1}
              step={0.01}
              onChange={setBackgroundAlpha}
              formatValue={(value) => `${Math.round(value * 100)}%`}
            />
            <TextRow
              label="Foreground hex"
              value={foregroundHex}
              onChange={setForegroundHex}
              placeholder="#ffffff"
            />
            <RangeRow
              label="Foreground alpha"
              value={foregroundAlpha}
              min={0}
              max={1}
              step={0.01}
              onChange={setForegroundAlpha}
              formatValue={(value) => `${Math.round(value * 100)}%`}
            />
          </InspectorSection>
        </div>
      </motion.aside>
    </section>
  );
}
