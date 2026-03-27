export const PATTERNS = [
  { label: "Sign", value: "sign" },
  { label: "Radial", value: "radial" },
  { label: "Spiral", value: "spiral" },
  { label: "Mandala", value: "mandala" },
] as const;

export const ITEM_SHAPES = [
  { label: "Square", value: "square" },
  { label: "Circle", value: "circle" },
  { label: "Triangle", value: "triangle" },
  { label: "Star", value: "star" },
  { label: "Glyph", value: "glyph" },
] as const;

const MATRIX_GLYPH_SET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=<>?/\\|[]{}";

export type ThemeMode = "light" | "dark";
export type PatternKind = (typeof PATTERNS)[number]["value"];
export type ItemShape = (typeof ITEM_SHAPES)[number]["value"];

export type Shockwave = {
  key: number;
  x: number;
  y: number;
};

export type PatternBackgroundProps = {
  rows: number;
  itemsPerRow: number;
  aspectRatio?: number;
  gap?: number;
  rotation?: number;
  itemRotation?: number;
  minOpacity: number;
  maxOpacity: number;
  frequency: number;
  rowShift: number;
  phase: number;
  pattern: PatternKind;
  itemShape: ItemShape;
  glyphText?: string;
  randomSeed: number;
  radialFrequency: number;
  radialTwist: number;
  animationSpeed?: number;
  isAnimating?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  itemColor?: string;
  enableShockwave?: boolean;
  shockwave?: Shockwave | null;
  shockwaves?: Shockwave[];
  theme?: ThemeMode;
  className?: string;
};

export type PatternBackgroundPreset = Omit<
  PatternBackgroundProps,
  "className" | "isAnimating" | "shockwave" | "shockwaves" | "theme"
>;

export const PATTERN_BACKGROUND_PRESETS = {
  demo: {
    rows: 20,
    itemsPerRow: 40,
    gap: 12,
    rotation: 0,
    itemRotation: 35,
    minOpacity: 0,
    maxOpacity: 1,
    frequency: 0.9,
    rowShift: 0.5,
    phase: 5.0,
    pattern: "spiral",
    itemShape: "star",
    glyphText: "A*7",
    randomSeed: 7,
    radialFrequency: 6,
    radialTwist: 3.5,
    animationSpeed: 1.65,
    backgroundColor: "rgba(0, 0, 0, 1.00)",
    foregroundColor: "rgba(255, 255, 255, 1.00)",
  },
  navbarDark: {
    rows: 3,
    itemsPerRow: 10,
    gap: 16,
    rotation: -24,
    itemRotation: 33,
    minOpacity: 0,
    maxOpacity: 0.74,
    frequency: 0.1,
    rowShift: 0.55,
    phase: 6.28,
    pattern: "mandala",
    itemShape: "star",
    glyphText: "+",
    randomSeed: 7,
    radialFrequency: 6,
    radialTwist: 3.5,
    animationSpeed: 0.9,
    backgroundColor: "rgba(0, 0, 0, 1)",
    foregroundColor: "rgba(255, 255, 255, 1)",
    itemColor: "rgba(255, 255, 255, 1)",
  },
  navbarLight: {
    rows: 3,
    itemsPerRow: 10,
    gap: 16,
    rotation: -24,
    itemRotation: 33,
    minOpacity: 0,
    maxOpacity: 0.74,
    frequency: 0.1,
    rowShift: 0.55,
    phase: 6.28,
    pattern: "mandala",
    itemShape: "star",
    glyphText: "+",
    randomSeed: 7,
    radialFrequency: 6,
    radialTwist: 3.5,
    animationSpeed: 0.9,
    backgroundColor: "rgba(0, 0, 0, 1)",
    foregroundColor: "rgba(255, 255, 255, 1)",
    itemColor: "rgba(255, 255, 255, 1)",
  },
} satisfies Record<string, PatternBackgroundPreset>;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeCanvasColor(
  color: string | undefined,
  fallback: string,
) {
  if (!color) {
    return fallback;
  }

  if (
    color.includes("rgb") ||
    color.startsWith("#") ||
    color.startsWith("hsl")
  ) {
    return color;
  }

  if (color.includes(",")) {
    return `rgba(${color})`;
  }

  return color;
}

export function getPatternValue(
  input: number,
  pattern: PatternKind,
  distance: number,
  angle: number,
  radialFrequency: number,
  radialTwist: number,
) {
  switch (pattern) {
    case "sign": {
      const value = Math.sin(input);

      return value === 0 ? 0 : Math.sign(value);
    }
    case "radial":
      return Math.sin(distance * radialFrequency * Math.PI * 2 - input * 1.35);
    case "spiral":
      return Math.sin(
        angle * radialFrequency +
          distance * radialTwist * Math.PI * 3.2 -
          input * 1.1,
      );
    case "mandala":
      return (
        Math.cos(angle * radialFrequency + input * 0.6) *
        Math.cos(distance * radialTwist * Math.PI * 3 - input * 0.9)
      );
    default:
      return Math.sign(Math.sin(input));
  }
}

export function getSeededValue(
  rowIndex: number,
  itemIndex: number,
  seed: number,
) {
  const value =
    Math.sin(rowIndex * 12.9898 + itemIndex * 78.233 + seed * 37.719) *
    43758.5453;

  return value - Math.floor(value);
}

export function getGlyphForCell(
  glyphs: readonly string[],
  glyphText: string,
  rowIndex: number,
  itemIndex: number,
  seed: number,
  phase: number,
) {
  if (glyphText === "$matrix") {
    const timeStep = Math.floor(phase * 10);
    const glyphIndex = Math.floor(
      getSeededValue(rowIndex + timeStep, itemIndex, seed + timeStep) *
        MATRIX_GLYPH_SET.length,
    );

    return MATRIX_GLYPH_SET[glyphIndex] ?? "A";
  }

  return (
    glyphs[(rowIndex * itemIndex + itemIndex + rowIndex) % glyphs.length] ?? "*"
  );
}

export function drawStar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const outerRadius = Math.min(width, height) * 0.5;
  const innerRadius = outerRadius * 0.48;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  context.beginPath();

  for (let pointIndex = 0; pointIndex < 8; pointIndex += 1) {
    const angle = -Math.PI / 2 + pointIndex * (Math.PI / 4);
    const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
    const pointX = centerX + Math.cos(angle) * radius;
    const pointY = centerY + Math.sin(angle) * radius;

    if (pointIndex === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  }

  context.closePath();
}

export function drawTriangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.beginPath();
  context.moveTo(x + width / 2, y);
  context.lineTo(x + width, y + height);
  context.lineTo(x, y + height);
  context.closePath();
}

export function drawShape(
  context: CanvasRenderingContext2D,
  shape: ItemShape,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  glyph: string,
  itemRotation: number,
) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  context.save();
  context.translate(centerX, centerY);
  context.rotate((itemRotation * Math.PI) / 180);
  context.translate(-centerX, -centerY);

  switch (shape) {
    case "circle":
      context.beginPath();
      context.ellipse(
        x + width / 2,
        y + height / 2,
        width / 2,
        height / 2,
        0,
        0,
        Math.PI * 2,
      );
      break;
    case "triangle":
      drawTriangle(context, x, y, width, height);
      break;
    case "star":
      drawStar(context, x, y, width, height);
      break;
    case "glyph": {
      const fontSize = Math.max(Math.min(width, height) * 0.92, 4);

      context.font = `${fontSize}px "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(glyph, x + width / 2, y + height / 2 + fontSize * 0.04);
      context.restore();
      return;
    }
    case "square":
    default:
      context.beginPath();
      context.roundRect(x, y, width, height, radius);
      break;
  }

  context.fill();
  context.restore();
}

type RenderPatternBackgroundOptions = Pick<
  PatternBackgroundProps,
  | "rows"
  | "itemsPerRow"
  | "gap"
  | "rotation"
  | "itemRotation"
  | "minOpacity"
  | "maxOpacity"
  | "frequency"
  | "rowShift"
  | "pattern"
  | "glyphText"
  | "itemShape"
  | "randomSeed"
  | "radialFrequency"
  | "radialTwist"
  | "enableShockwave"
  | "shockwave"
  | "shockwaves"
> & {
  graphicWidth: number;
  graphicHeight: number;
  phase: number;
  backgroundColor: string;
  foregroundColor: string;
  itemColor: string;
  now: number;
};

export function renderPatternBackground(
  canvas: HTMLCanvasElement,
  {
    rows,
    itemsPerRow,
    gap = 6,
    rotation = 0,
    itemRotation = 0,
    minOpacity,
    maxOpacity,
    frequency,
    rowShift,
    phase,
    pattern,
    glyphText = "A*7",
    itemShape,
    randomSeed,
    radialFrequency,
    radialTwist,
    enableShockwave = false,
    shockwave = null,
    shockwaves,
    graphicWidth,
    graphicHeight,
    backgroundColor,
    foregroundColor,
    itemColor,
    now,
  }: RenderPatternBackgroundOptions,
) {
  if (graphicWidth === 0) {
    return;
  }

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const displayWidth = graphicWidth;
  const displayHeight = graphicHeight;
  const width = Math.max(1, Math.round(displayWidth * ratio));
  const height = Math.max(1, Math.round(displayHeight * ratio));
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.scale(ratio, ratio);
  context.clearRect(0, 0, displayWidth, displayHeight);
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, displayWidth, displayHeight);

  const resolvedGap = displayWidth < 640 ? Math.max(0, gap - 2) : gap;
  const cellSize = Math.max(
    2,
    Math.min(
      (displayWidth - resolvedGap * Math.max(itemsPerRow - 1, 0)) /
        Math.max(itemsPerRow, 1),
      (displayHeight - resolvedGap * Math.max(rows - 1, 0)) / Math.max(rows, 1),
    ),
  );
  const cellWidth = cellSize;
  const cellHeight = cellSize;
  const radius = Math.min(cellWidth, cellHeight) * 0.18;
  const gridWidth =
    itemsPerRow * cellWidth + Math.max(itemsPerRow - 1, 0) * resolvedGap;
  const gridHeight = rows * cellHeight + Math.max(rows - 1, 0) * resolvedGap;
  const offsetX = (displayWidth - gridWidth) / 2;
  const offsetY = (displayHeight - gridHeight) / 2;
  const centerX = offsetX + gridWidth / 2;
  const centerY = offsetY + gridHeight / 2;
  const maxDistanceToCorner = Math.max(
    1,
    Math.hypot(offsetX - centerX, offsetY - centerY),
    Math.hypot(offsetX + gridWidth - centerX, offsetY - centerY),
    Math.hypot(offsetX - centerX, offsetY + gridHeight - centerY),
    Math.hypot(offsetX + gridWidth - centerX, offsetY + gridHeight - centerY),
  );
  const isCircularWave =
    pattern === "radial" || pattern === "spiral" || pattern === "mandala";
  const rotationRadians = (rotation * Math.PI) / 180;
  const cosRotation = Math.cos(rotationRadians);
  const sinRotation = Math.sin(rotationRadians);
  const shockwaveBand = Math.max(Math.min(cellWidth, cellHeight) * 3.5, 20);
  const glyphs = Array.from(glyphText.trim() || "*");
  const activeShockwaves = enableShockwave
    ? (shockwaves ?? (shockwave ? [shockwave] : [])).flatMap(
        (currentShockwave) => {
          const shockwaveElapsed = (now - currentShockwave.key) / 1000;
          const shockwaveProgress = clamp(shockwaveElapsed * 1.8, 0, 1);

          if (shockwaveProgress >= 1) {
            return [];
          }

          return [
            {
              x: currentShockwave.x,
              y: currentShockwave.y,
              progress: shockwaveProgress,
              radius: shockwaveProgress * Math.max(gridWidth, gridHeight) * 0.9,
            },
          ];
        },
      )
    : [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let itemIndex = 0; itemIndex < itemsPerRow; itemIndex += 1) {
      const seededValue = getSeededValue(rowIndex, itemIndex, randomSeed);
      const x = offsetX + itemIndex * (cellWidth + resolvedGap);
      const y = offsetY + rowIndex * (cellHeight + resolvedGap);
      const cellCenterX = x + cellWidth / 2;
      const cellCenterY = y + cellHeight / 2;
      const deltaX = cellCenterX - centerX;
      const deltaY = cellCenterY - centerY;
      const rotatedDeltaX = deltaX * cosRotation - deltaY * sinRotation;
      const rotatedDeltaY = deltaX * sinRotation + deltaY * cosRotation;
      const normalizedX = rotatedDeltaX / Math.max(centerX, 1);
      const normalizedY = rotatedDeltaY / Math.max(centerY, 1);
      const distance = clamp(
        Math.hypot(rotatedDeltaX, rotatedDeltaY) / maxDistanceToCorner,
        0,
        1,
      );
      const angle = Math.atan2(normalizedY, normalizedX);
      const linearInput =
        normalizedX * frequency * itemsPerRow + normalizedY * rowShift * rows;
      const animationInput = isCircularWave ? phase : linearInput + phase;
      const wave = getPatternValue(
        animationInput + (seededValue - 0.5) * (isCircularWave ? 0.18 : 0.9),
        pattern,
        distance,
        angle,
        radialFrequency,
        radialTwist,
      );
      const normalized = clamp(
        ((wave + 1) / 2) * (isCircularWave ? 0.92 : 0.84) +
          seededValue * (isCircularWave ? 0.08 : 0.16),
        0,
        1,
      );
      let opacity = minOpacity + normalized * (maxOpacity - minOpacity);

      if (activeShockwaves.length > 0) {
        let shockwaveBoost = 0;

        for (const activeShockwave of activeShockwaves) {
          const shockDistance = Math.hypot(
            cellCenterX - activeShockwave.x,
            cellCenterY - activeShockwave.y,
          );
          const ringDistance = Math.abs(shockDistance - activeShockwave.radius);
          const ringStrength = clamp(1 - ringDistance / shockwaveBand, 0, 1);
          const centerGlow = clamp(
            1 -
              shockDistance /
                Math.max(activeShockwave.radius * 0.55, shockwaveBand),
            0,
            1,
          );

          shockwaveBoost +=
            ringStrength * 0.55 * (1 - activeShockwave.progress * 0.35) +
            centerGlow * 0.18;
        }

        opacity = clamp(opacity + shockwaveBoost, minOpacity, 1);
      }

      context.save();
      context.fillStyle = itemColor;
      context.globalAlpha = opacity;
      const glyph = getGlyphForCell(
        glyphs,
        glyphText,
        rowIndex,
        itemIndex,
        randomSeed,
        phase,
      );
      drawShape(
        context,
        itemShape,
        x,
        y,
        cellWidth,
        cellHeight,
        radius,
        glyph,
        itemRotation,
      );
      context.restore();
    }
  }

  if (foregroundColor !== itemColor) {
    context.save();
    context.strokeStyle = foregroundColor;
    context.globalAlpha = 0.14;
    context.lineWidth = 1;
    context.strokeRect(0.5, 0.5, displayWidth - 1, displayHeight - 1);
    context.restore();
  }
}
