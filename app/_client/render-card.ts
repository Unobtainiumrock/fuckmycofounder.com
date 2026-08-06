import type { CookedQuizReport } from "@/src/modules/cooked-quiz";

const width = 1200;
const height = 1500;
const colors = {
  paper: "#f4eddf",
  ink: "#151515",
  red: "#ff3b20",
  acid: "#d8ff3e",
};

export async function renderCardBlob(
  report: CookedQuizReport,
  avatarUrl?: string,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Card rendering is unavailable.");

  const avatar = avatarUrl ? await loadImage(avatarUrl) : undefined;
  drawFrame(context, report);
  drawSections(context, report, avatar);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Card rendering failed."));
    }, "image/png");
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Mugshot load failed."));
    image.src = url;
  });
}

function drawFrame(
  context: CanvasRenderingContext2D,
  report: CookedQuizReport,
): void {
  context.fillStyle = colors.ink;
  context.fillRect(0, 0, width, height);
  context.fillStyle = colors.red;
  context.fillRect(0, 0, width, 34);
  context.fillStyle = colors.paper;
  context.font = "900 32px monospace";
  context.fillText("F/MC INCIDENT REPORT", 72, 110);
  context.textAlign = "right";
  context.fillText(`CASE #${report.id}`, width - 72, 110);
  context.textAlign = "left";
  context.strokeStyle = "rgba(244,237,223,.4)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(72, 145);
  context.lineTo(width - 72, 145);
  context.stroke();
  context.save();
  context.translate(78, 215);
  context.rotate(-0.018);
  context.fillStyle = colors.red;
  context.fillRect(0, -45, 520, 70);
  context.fillStyle = colors.ink;
  context.font = "900 25px monospace";
  context.fillText(`SEVERITY: ${report.severity.toUpperCase()}`, 18, 1);
  context.restore();
}

function drawSections(
  context: CanvasRenderingContext2D,
  report: CookedQuizReport,
  avatar?: HTMLImageElement,
): void {
  const left = 72;
  const maximumWidth = width - 144;
  const sections: ReadonlyArray<
    readonly [string, string, number, number, number, number]
  > = [
    ["CHARGE", report.charge, 46, 56, 2, 30],
    ["STATEMENT", `My cofounder ${report.incident}.`, 37, 48, 5, 24],
    ["THEIR DEFENSE", `“${report.quote}”`, 37, 48, 4, 24],
    ["ADULT TRANSLATION", report.translation, 37, 48, 3, 24],
  ];
  if (avatar) drawAvatar(context, avatar);
  let y = 305;
  for (const [
    heading,
    text,
    size,
    lineHeight,
    maximumLines,
    minimumSize,
  ] of sections) {
    const sectionWidth = avatar && y < 446 ? maximumWidth - 272 : maximumWidth;
    drawLabel(context, heading, left, y);
    y += 48;
    context.fillStyle = colors.paper;
    y =
      drawFitted(context, text, {
        baseSize: size,
        lineHeight,
        maximumLines,
        maximumWidth: sectionWidth,
        minimumSize,
        x: left,
        y,
      }) + 38;
    context.strokeStyle = "rgba(244,237,223,.16)";
    context.beginPath();
    context.moveTo(left, y - 15);
    context.lineTo(left + sectionWidth, y - 15);
    context.stroke();
  }
  const footerTop = Math.max(y + 20, 1125);
  context.fillStyle = colors.red;
  context.fillRect(left, footerTop, width - left * 2, 5);
  drawLabel(context, "BOARD DISPOSITION", left, footerTop + 55);
  context.fillStyle = colors.acid;
  drawFitted(context, report.disposition.toUpperCase(), {
    baseSize: 80,
    lineHeight: 67,
    maximumLines: 3,
    maximumWidth,
    minimumSize: 34,
    x: left,
    y: footerTop + 125,
    fontForSize: (size) => `900 ${size}px Impact, Arial Narrow, sans-serif`,
  });
  context.fillStyle = "rgba(244,237,223,.62)";
  context.font = "700 24px monospace";
  context.fillText("FUCKMYCOFOUNDER.COM", left, height - 67);
}

function drawAvatar(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
): void {
  const size = 200;
  const x = width - 72 - size - 24;
  const y = 172;
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;
  const frameWidth = size + 24;
  const frameHeight = size + 12 + 38;
  context.save();
  context.translate(x + frameWidth / 2, y + frameHeight / 2);
  context.rotate(0.028);
  context.translate(-frameWidth / 2, -frameHeight / 2);
  context.fillStyle = "rgba(0,0,0,.45)";
  context.fillRect(10, 10, frameWidth, frameHeight);
  context.fillStyle = colors.paper;
  context.fillRect(0, 0, frameWidth, frameHeight);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    12,
    12,
    size,
    size,
  );
  context.fillStyle = colors.ink;
  context.font = "900 22px monospace";
  context.textAlign = "center";
  context.fillText("SUBJECT", frameWidth / 2, size + 12 + 28);
  context.restore();
}

function drawFitted(
  context: CanvasRenderingContext2D,
  text: string,
  options: {
    readonly baseSize: number;
    readonly fontForSize?: (size: number) => string;
    readonly lineHeight: number;
    readonly maximumLines: number;
    readonly maximumWidth: number;
    readonly minimumSize: number;
    readonly x: number;
    readonly y: number;
  },
): number {
  const fontForSize =
    options.fontForSize ??
    ((size: number) => `700 ${size}px Arial, sans-serif`);
  let size = options.baseSize;
  context.font = fontForSize(size);
  let lines = wrapLines(context, text, options.maximumWidth);
  while (size > options.minimumSize && lines.length > options.maximumLines) {
    size -= 1;
    context.font = fontForSize(size);
    lines = wrapLines(context, text, options.maximumWidth);
  }
  context.font = fontForSize(size);
  lines = lines.slice(0, options.maximumLines);
  lines.forEach((line, index) =>
    context.fillText(line, options.x, options.y + index * options.lineHeight),
  );
  return options.y + lines.length * options.lineHeight;
}

function wrapLines(
  context: CanvasRenderingContext2D,
  text: string,
  maximumWidth: number,
): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/u)) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maximumWidth || !current)
      current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawLabel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
): void {
  context.fillStyle = "rgba(244,237,223,.62)";
  context.font = "700 23px monospace";
  context.fillText(text, x, y);
}
