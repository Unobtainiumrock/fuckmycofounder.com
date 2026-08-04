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

const AVATAR = { size: 200, pad: 12, caption: 38, top: 172 };
const AVATAR_FRAME_WIDTH = AVATAR.size + AVATAR.pad * 2;
const AVATAR_BOTTOM = AVATAR.top + AVATAR.size + AVATAR.pad + AVATAR.caption + 24;

function drawAvatar(context, image) {
  const frameHeight = AVATAR.size + AVATAR.pad + AVATAR.caption;
  const x = WIDTH - 72 - AVATAR_FRAME_WIDTH;
  const y = AVATAR.top;

  context.save();
  context.translate(x + AVATAR_FRAME_WIDTH / 2, y + frameHeight / 2);
  context.rotate(0.028);
  context.translate(-AVATAR_FRAME_WIDTH / 2, -frameHeight / 2);
  context.fillStyle = "rgba(0,0,0,.45)";
  context.fillRect(10, 10, AVATAR_FRAME_WIDTH, frameHeight);
  context.fillStyle = COLORS.paper;
  context.fillRect(0, 0, AVATAR_FRAME_WIDTH, frameHeight);
  context.drawImage(image, AVATAR.pad, AVATAR.pad, AVATAR.size, AVATAR.size);
  context.fillStyle = COLORS.ink;
  context.font = "900 22px monospace";
  context.textAlign = "center";
  context.fillText("SUBJECT", AVATAR_FRAME_WIDTH / 2, AVATAR.size + AVATAR.pad + 28);
  context.restore();
  context.textAlign = "left";
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

  let avatarDrawn = false;
  if (report.avatarUrl) {
    try {
      drawAvatar(context, await loadImage(report.avatarUrl));
      avatarDrawn = true;
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
    // Keep text clear of the polaroid while a section sits beside it.
    const besideAvatar = avatarDrawn && y < AVATAR_BOTTOM;
    const sectionMax = besideAvatar ? max - AVATAR_FRAME_WIDTH - 48 : max;
    label(context, heading, left, y);
    y += 48;
    context.fillStyle = COLORS.paper;
    const fitted = fitCanvasSection(context, text, sectionMax, baseSize, minSize, maxLines, lineHeight);
    context.font = fitted.font;
    y = drawCanvasLines(context, fitted.lines, left, y, lineHeight) + 38;
    context.strokeStyle = "rgba(244,237,223,.16)";
    context.beginPath();
    context.moveTo(left, y - 15);
    context.lineTo(besideAvatar ? left + sectionMax : WIDTH - left, y - 15);
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
