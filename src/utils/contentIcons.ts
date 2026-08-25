import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faJs, faNodeJs } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowTrendUp,
  faBriefcase,
  faCloudArrowUp,
  faGamepad,
  faLayerGroup,
  faRectangleList,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { faIcon } from "./icons";

const guideIcons: Record<string, IconDefinition> = {
  "transition-into-tech": faUserGraduate,
  "engineering-career-growth": faArrowTrendUp,
  "engineering-practice": faBriefcase,
};

const courseIcons: Record<string, IconDefinition> = {
  "web-foundations": faLayerGroup,
  "javascript-frontend": faJs,
  "javascript-backend": faNodeJs,
  "devops-delivery": faCloudArrowUp,
};

const projectIcons: Record<string, IconDefinition> = {
  "nioh2-save-editor": faGamepad,
};

export function getGuideIcon(slug: string, size = 18): string {
  return faIcon(guideIcons[slug] ?? faRectangleList, { size });
}

export function getCourseIcon(slug: string, size = 18): string {
  return faIcon(courseIcons[slug] ?? faRectangleList, { size });
}

export function getProjectIcon(slug: string, size = 18): string {
  return faIcon(projectIcons[slug] ?? faRectangleList, { size });
}
