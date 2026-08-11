const fields = {
  "[data-report-charge]": { maxRem: 0.9, minRem: 0.68, maxLines: 2 },
  "[data-report-incident]": { maxRem: 0.9, minRem: 0.72, maxLines: 5 },
  "[data-report-quote]": { maxRem: 0.9, minRem: 0.72, maxLines: 4 },
  "[data-report-translation]": { maxRem: 0.9, minRem: 0.74, maxLines: 3 },
  "[data-report-disposition]": { maxRem: 2.6, minRem: 1.35, maxLines: 3 },
};

export function fitCaseFile(root: ParentNode): void {
  for (const [selector, options] of Object.entries(fields)) {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) continue;
    let size = options.maxRem;
    element.style.fontSize = `${size}rem`;
    element.style.lineHeight = "1.35";
    element.style.overflowWrap = "anywhere";
    while (size > options.minRem && lineCount(element) > options.maxLines) {
      size -= 0.04;
      element.style.fontSize = `${size}rem`;
    }
  }
}

function lineCount(element: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getClientRects().length;
}
