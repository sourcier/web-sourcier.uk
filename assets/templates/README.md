# Sourcier PowerPoint Template

This folder contains a branded PowerPoint template aligned with the current blog design system:

- Primary accent: `#e8006a`
- Secondary accent: `#2a7d5b`
- Warm surface tones: `#f6ece1` to `#e5d8c9`
- Elevated card surface: `#fffaf4`
- Dark hero tones: `#0a0a0a` to `#101410`
- Body text colour: `#0f0f0f`
- Heading font: `Barlow Condensed`
- Body font: `Barlow`

## Generate the template

From the site repo root:

```sh
pnpm run template:pptx
```

This command regenerates:

- `assets/templates/sourcier-blog-template.pptx`

## Included slide layouts

1. Title slide
2. Section divider
3. Two-column content slide
4. Quote slide
5. Image + caption slide
6. Closing slide

## Use as a reusable PowerPoint template

1. Open `sourcier-blog-template.pptx` in PowerPoint.
2. Choose **File → Save As Template**.
3. Save as `.potx` in your PowerPoint templates directory.

## Customization

- Edit generation logic in `scripts/create-powerpoint-template.mjs`.
- Re-run `pnpm run template:pptx` after changes.
