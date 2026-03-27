export function toRgbaString(
  red: number,
  green: number,
  blue: number,
  alpha: number,
) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(2)})`;
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return { red, green, blue };
}
