import { drawCanvasLines, fitCanvasSection } from "./text-fit.js";

const WIDTH = 1200;
const HEIGHT = 1500;
const COLORS = { paper: "#f4eddf", ink: "#151515", red: "#ff3b20", acid: "#d8ff3e" };

function label(context, text, x, y) {
  context.fillStyle = "rgba(244,237,223,.62)";
  context.font = "700 23px monospace";
  context.fillText(text, x, y);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Avatar load failed."));
    image.src = url;
  });
}

function drawAvatar(context, image) {
  const size = 168;
  const x = WIDTH - 72 - size;
  const y = 158;
  context.save();
  context.fillStyle = COLORS.red;
  context.fillRect(x - 8, y - 8, size + 16, size + 16);
  context.beginPath();
  context.rect(x, y, size, size);
  context.clip();
  context.drawImage(image, x, y, size, size);
  context.restore();
  context.strokeStyle = COLORS.paper;
  context.lineWidth = 4;
  context.strokeRect(x, y, size, size);
  label(context, "SUBJECT", x, y - 14);
}

export async function renderCardBlob(report) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");

  context.fillStyle = COLORS.ink;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = COLORS.red;
  context.fillRect(0, 0, WIDTH, 34);

  context.fillStyle = COLORS.paper;
  context.font = "900 32px monospace";
  context.fillText("F/MC INCIDENT REPORT", 72, 110);
  context.textAlign = "right";
  context.fillText(`CASE #${report.id}`, WIDTH - 72, 110);
  context.textAlign = "left";
  context.strokeStyle = "rgba(244,237,223,.4)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(72, 145);
  context.lineTo(WIDTH - 72, 145);
  context.stroke();

  if (report.avatarUrl) {
    try {
      drawAvatar(context, await loadImage(report.avatarUrl));
    } catch {
      // Card still renders without the mugshot.
    }
  }

  context.save();
  context.translate(78, 215);
  context.rotate(-0.018);
  context.fillStyle = COLORS.red;
  context.fillRect(0, -45, 520, 70);
  context.fillStyle = COLORS.ink;
  context.font = "900 25px monospace";
  context.fillText(`SEVERITY: ${report.severity.toUpperCase()}`, 18, 1);
  context.restore();

  let y = 305;
  const left = 72;
  const max = WIDTH - 144;
  const sections = [
    ["CHARGE", report.charge, 46, 56, 2, 30],
    ["STATEMENT", `My cofounder ${report.incident}.`, 37, 48, 5, 24],
    ["THEIR DEFENSE", `“${report.quote}”`, 37, 48, 4, 24],
    ["ADULT TRANSLATION", report.translation, 37, 48, 3, 24]
  ];

  for (const [heading, text, baseSize, lineHeight, maxLines, minSize] of sections) {
    label(context, heading, left, y);
    y += 48;
    context.fillStyle = COLORS.paper;
    const fitted = fitCanvasSection(context, text, max, baseSize, minSize, maxLines, lineHeight);
    context.font = fitted.font;
    y = drawCanvasLines(context, fitted.lines, left, y, lineHeight) + 38;
    context.strokeStyle = "rgba(244,237,223,.16)";
    context.beginPath();
    context.moveTo(left, y - 15);
    context.lineTo(WIDTH - left, y - 15);
    context.stroke();
  }

  const footerTop = Math.max(y + 20, 1125);
  context.fillStyle = COLORS.red;
  context.fillRect(left, footerTop, WIDTH - left * 2, 5);
  label(context, "BOARD DISPOSITION", left, footerTop + 55);
  context.fillStyle = COLORS.acid;
  const disposition = fitCanvasSection(
    context,
    report.disposition.toUpperCase(),
    max,
    80,
    61,
    34,
    3,
    67,
    (size) => `900 ${size}px Impact, Arial Narrow, sans-serif`
  );
  context.font = disposition.font;
  drawCanvasLines(context, disposition.lines, left, footerTop + 125, 67);
  context.fillStyle = "rgba(244,237,223,.62)";
  context.font = "700 24px monospace";
  context.fillText("FUCKMYCOFOUNDER.COM  ·  SATIRE, OBVIOUSLY", left, HEIGHT - 67);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Card rendering failed.")), "image/png");
  });
}
