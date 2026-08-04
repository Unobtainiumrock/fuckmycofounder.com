const DOM_FIELD_FIT = {
  "[data-report-charge]": { maxRem: 0.9, minRem: 0.68, maxLines: 2 },
  "[data-report-incident]": { maxRem: 0.9, minRem: 0.72, maxLines: 5 },
  "[data-report-quote]": { maxRem: 0.9, minRem: 0.72, maxLines: 4 },
  "[data-report-translation]": { maxRem: 0.9, minRem: 0.74, maxLines: 3 },
  "[data-report-disposition]": { maxRem: 2.6, minRem: 1.35, maxLines: 3 }
};

function lineCount(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getClientRects().length;
}

function fitElement(element, { maxRem, minRem, maxLines }) {
  if (!element) return;
  const rootFont = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  let sizeRem = maxRem;
  element.style.fontSize = `${sizeRem}rem`;
  element.style.lineHeight = "1.35";
  element.style.overflowWrap = "anywhere";

  while (sizeRem > minRem && lineCount(element) > maxLines) {
    sizeRem -= 0.04;
    element.style.fontSize = `${sizeRem}rem`;
  }
}

export function fitCaseFileFields(root) {
  for (const [selector, options] of Object.entries(DOM_FIELD_FIT)) {
    fitElement(root.querySelector(selector), options);
  }
}

export function fitCanvasSection(context, text, maxWidth, baseSize, minSize, maxLines, lineHeight, fontForSize = (size) => `700 ${size}px Arial, sans-serif`) {
  let fontSize = baseSize;
  let lines = [];

  while (fontSize >= minSize) {
    context.font = fontForSize(fontSize);
    lines = wrapCanvasLines(context, text, maxWidth);
    if (lines.length <= maxLines) break;
    fontSize -= 1;
  }

  if (lines.length > maxLines) lines = lines.slice(0, maxLines);

  const height = lines.length * lineHeight;
  return { fontSize, lines, height, font: fontForSize(fontSize) };
}

function wrapCanvasLines(context, text, maxWidth) {
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

export function drawCanvasLines(context, lines, x, y, lineHeight) {
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}
