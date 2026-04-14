/// <reference types="astro/client" />
/// <reference types="astro/astro-jsx" />

declare global {
  namespace JSX {
    interface IntrinsicElements extends astroHTML.JSX.DefinedIntrinsicElements {}
  }
}

export {};
