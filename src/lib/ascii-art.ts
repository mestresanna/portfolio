export const ASCII_CHARS = " .,:;irsXA253hMHGS#9B&@"

export const ASCII_COLUMNS = 120
export const CHAR_ASPECT_RATIO = 0.5
export const CANVAS_FONT = "10px monospace"

/** Standard luma-weighted brightness from RGB. */
export function getBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/** Maps a 0–255 brightness value to a character in the ASCII ramp. */
export function brightnessToChar(brightness: number): string {
  const index = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1))
  return ASCII_CHARS[index]
}

/** Blends a color channel toward grayscale by `amount` (0 = color, 1 = grayscale). */
export function mixTowardGray(channel: number, gray: number, amount: number): number {
  return channel * (1 - amount) + gray * amount
}

export function computeGridDimensions(videoWidth: number, videoHeight: number) {
  const columns = ASCII_COLUMNS
  const rows = Math.floor(columns * (videoHeight / videoWidth) * CHAR_ASPECT_RATIO)
  return { columns, rows }
}
