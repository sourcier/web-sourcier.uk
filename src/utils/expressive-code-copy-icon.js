import { faCopy } from "@fortawesome/free-solid-svg-icons";

const [faCopyWidth, faCopyHeight, , , faCopyPathData] = faCopy.icon;
const faCopyPaths = Array.isArray(faCopyPathData)
  ? faCopyPathData
  : [faCopyPathData];

const faCopySvg = [
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${faCopyWidth} ${faCopyHeight}'>`,
  ...faCopyPaths.map((path) => `<path fill='black' d='${path}'/>`),
  `</svg>`,
].join("");

/** @param {string} svg */
const toInlineSvgCssUrl = (svg) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export const expressiveCodeCopyIcon = toInlineSvgCssUrl(faCopySvg);
