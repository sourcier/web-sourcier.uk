import { faCopy } from "@fortawesome/free-regular-svg-icons";

const [faCopyWidth, faCopyHeight, , , faCopyPathData] = faCopy.icon;
const faCopyPath = Array.isArray(faCopyPathData)
  ? faCopyPathData.join(" ")
  : faCopyPathData;

const faCopySvg = [
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${faCopyWidth} ${faCopyHeight}'>`,
  `<path fill='black' d='${faCopyPath}'/>`,
  `</svg>`,
].join("");

/** @param {string} svg */
const toInlineSvgCssUrl = (svg) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export const expressiveCodeCopyIcon = toInlineSvgCssUrl(faCopySvg);
