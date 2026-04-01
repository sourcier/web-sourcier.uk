---
description: 'Visual design system for SVG wireframes and UI mockups used in blog posts on sourcier.uk'
applyTo: '**/*.svg'
---

# Wireframe Design System

This standard applies to all hand-drawn SVG wireframes and UI mockups used in articles. The goal is a consistent, sketchy, paper-feel aesthetic that matches the blog's brand.

## Canvas

- **Dimensions:** `700 × 500` (adjust height for taller content, keep 700px wide)
- **Background:** `#fafaf7` (off-white, paper feel)
- **Font family:** `'Courier New', Courier, monospace`

## Sketch Filter

Every structural element gets `filter="url(#sketch)"` to produce the hand-drawn wobble effect. Define once in `<defs>`:

```xml
<defs>
  <filter id="sketch">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
```

Do **not** apply the sketch filter to text elements — it makes them unreadable.

## Colours

| Role | Value |
|---|---|
| Paper background | `#fafaf7` |
| Navbar background | `#1e1b2e` (dark purple) |
| Brand accent (annotations, focus states) | `#e8006a` |
| Card / modal background | `white` |
| Dark card background | `#282c34` |
| Border / stroke | `#aaa`, `#d4d0cc`, `#ece9e4` |
| Ghost elements (inactive icons) | `rgba(255,255,255,0.35)` stroke |
| Placeholder text bars (title) | `#2d2a3e` |
| Placeholder text bars (body) | `#c0bdb7` |
| Skeleton image placeholder | `#edeae4` fill, `#c8c4bc` stroke |

## Typography

- Font size: `11–14px` depending on element
- Nav logo: `font-size="14"`, `font-weight="bold"`, `fill="white"`, `letter-spacing="0.5"`
- Nav links: `font-size="12"`, `fill="rgba(255,255,255,0.7)"`
- Annotation labels: `font-size="11"`, `fill="#e8006a"`

## Navbar (standard)

The navbar sits at `y=8`, `height=50`, background `#1e1b2e`:

| Element | Position | Notes |
|---|---|---|
| Logo circle | `cx=34 cy=33 r=11` | `stroke="rgba(255,255,255,0.6)"` |
| Logo text "Sourcier" | `x=52 y=39` | bold, white |
| Nav links (About, Blog, Contact) | `x=272,324,370 y=38` | muted white |
| Search icon | **First** icon at right, `cx=558 cy=31 r=8` | white, full opacity — active/highlighted |
| Ghost social circles | `cx=584,610,636 cy=33 r=9` | `rgba(255,255,255,0.35)` — inactive |

The search icon is always the **first** icon in the right-hand navbar group, before social icons.

## Search Icon

Draw as a circle + handle line:

```xml
<!-- Circle -->
<circle cx="{x}" cy="{cy}" r="8" fill="none" stroke="{color}" stroke-width="2" filter="url(#sketch)"/>
<!-- Handle — offset +6x +6y from centre, extend +7x +7y -->
<line x1="{x+6}" y1="{cy+6}" x2="{x+13}" y2="{cy+13}" stroke="{color}" stroke-width="2.2" stroke-linecap="round" filter="url(#sketch)"/>
```

For the highlighted (active) version: `stroke="rgba(255,255,255,0.95)"`.
For the dark input-strip version: `stroke="#888"`.

## Annotation Style

Annotations use dashed pink lines with an arrowhead pointing to the element:

```xml
<!-- Arrowhead marker — define once in <defs> -->
<marker id="tip" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
  <polygon points="0 0, 8 3, 0 6" fill="#e8006a"/>
</marker>

<!-- Annotation line -->
<text x="{labelX}" y="{labelY}" font-size="11" fill="#e8006a">label text</text>
<line x1="{lineStartX}" y1="{lineStartY}" x2="{arrowEndX}" y2="{arrowEndY}"
      stroke="#e8006a" stroke-width="1.2" stroke-dasharray="5 3" marker-end="url(#tip)"/>
```

Annotation labels sit to the **left or bottom** of the diagram. Lines go from label toward the target element.

## Modals and Cards

- **Drop shadow rect:** `fill="rgba(0,0,0,0.18)"`, offset `+6x +6y` from card, same `rx`
- **Card rect:** `fill="white"`, `stroke="#d4d0cc"`, `stroke-width="1"`, `rx="8"`
- **Backdrop overlay:** `fill="rgba(0,0,0,0.48)"` covering everything below the navbar

## Input Strip

- `fill="#f5f3f0"`, separator line below: `stroke="#e0ddd8"`
- Search icon inside: `stroke="#888"`, `stroke-width="1.8"`
- Placeholder text: `fill="#aaa"`
- ESC badge: `fill="none"`, `stroke="#ccc"`, `rx="4"` rounded rect + `fill="#aaa"` text
- Close `×`: `fill="#bbb"`

## Result Rows

**Normal row:**
- `fill="white"`, `stroke="#ece9e4"`, `rx="5"`
- Thumbnail placeholder: `fill="#edeae4"`, `stroke="#c8c4bc"`, crossed by two diagonal lines
- Title bar: `fill="#2d2a3e"`, `height=11`, `rx=3`
- Body bars: `fill="#c0bdb7"`, `height=9`, `rx=3`

**Focused row:**
- `fill="#fdf2f8"`, `stroke="#f0bed8"` (pink tint)
- Left accent: `fill="#e8006a"`, `width=4`, `rx=2` — flush to left edge of row

## Keyboard Hints Footer

- Horizontal divider above hints
- Icons as unicode: `↑↓` `↵` `esc`
- `font-size="11"`, `fill="#aaa"`

## Naming

SVG files follow the pattern `<slug>-wireframe.svg` and live alongside `index.md` in the post directory. They are automatically copied to `public/post-images/<slug>/` by `scripts/copy-post-images.mjs`.
