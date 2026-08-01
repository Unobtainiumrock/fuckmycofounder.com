const WIDTH = 1200;
const HEIGHT = 1500;
const COLORS = { paper: "#f4eddf", ink: "#151515", red: "#ff3b20", acid: "#d8ff3e" };

function wrapLines(context, text, maxWidth) {
  const words = text.split(/\s+/u);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrapped(context, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const lines = wrapLines(context, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function label(context, text, x, y) {
  context.fillStyle = "rgba(244,237,223,.62)";
  context.font = "700 23px monospace";
  context.fillText(text, x, y);
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
    ["CHARGE", report.charge, 46, 56, 2],
    ["STATEMENT", `My cofounder ${report.incident}.`, 37, 48, 4],
    ["THEIR DEFENSE", `“${report.quote}”`, 37, 48, 3],
    ["ADULT TRANSLATION", report.translation, 37, 48, 3]
  ];

  for (const [heading, text, size, lineHeight, maxLines] of sections) {
    label(context, heading, left, y);
    y += 48;
    context.fillStyle = COLORS.paper;
    context.font = `700 ${size}px Arial, sans-serif`;
    y = drawWrapped(context, text, left, y, max, lineHeight, maxLines) + 38;
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
  context.font = "900 61px Impact, Arial Narrow, sans-serif";
  drawWrapped(context, report.disposition.toUpperCase(), left, footerTop + 125, max, 67, 3);
  context.fillStyle = "rgba(244,237,223,.62)";
  context.font = "700 24px monospace";
  context.fillText("FUCKMYCOFOUNDER.COM  ·  SATIRE, OBVIOUSLY", left, HEIGHT - 67);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Card rendering failed.")), "image/png");
  });
}
