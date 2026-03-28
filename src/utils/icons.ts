import { icon, type IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface IconOptions {
  class?: string;
  size?: number;
}

export function faIcon(
  iconDef: IconDefinition,
  { class: className, size = 20 }: IconOptions = {},
): string {
  return icon(iconDef, {
    attributes: {
      "aria-hidden": "true",
      width: String(size),
      height: String(size),
      ...(className ? { class: className } : {}),
    },
  }).html[0];
}
