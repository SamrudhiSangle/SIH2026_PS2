---
name: Hydrographic Editorial
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#343944'
  surface-container-lowest: '#090e17'
  surface-container-low: '#171c25'
  surface-container: '#1b2029'
  surface-container-high: '#252a34'
  surface-container-highest: '#30353f'
  on-surface: '#dee2f0'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dee2f0'
  inverse-on-surface: '#2c303b'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4fdbc8'
  on-secondary: '#003731'
  secondary-container: '#04b4a2'
  on-secondary-container: '#003f38'
  tertiary: '#bdcee7'
  on-tertiary: '#213145'
  tertiary-container: '#a2b2cb'
  on-tertiary-container: '#35455a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#0f131d'
  on-background: '#dee2f0'
  surface-variant: '#30353f'
typography:
  display-hero:
    fontFamily: Newsreader
    fontSize: 4.5rem
    fontWeight: '400'
    lineHeight: 5rem
    letterSpacing: -0.025em
  display-hero-mobile:
    fontFamily: Newsreader
    fontSize: 2.75rem
    fontWeight: '400'
    lineHeight: 3.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 3rem
    fontWeight: '400'
    lineHeight: 3.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 2rem
    fontWeight: '400'
    lineHeight: 2.5rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Newsreader
    fontSize: 2rem
    fontWeight: '400'
    lineHeight: 2.5rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 1.375rem
    fontWeight: '500'
    lineHeight: 1.875rem
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.875rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: '0'
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0.06em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.12em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 2rem
  gutter-mobile: 1rem
  margin: 4rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 3rem
---

## Brand & Style

This design system draws visual lineage from archival cartography, deep bathymetric surveys, and prestigious scientific monographs. The aesthetic rejects the frenetic conventions of operational telemetry dashboards, commercial SaaS platforms, and garish neon tech tropes. In their place, it institutes an uncompromising, quiet authority: expansive negative space, calibrated oceanic depths, and museum-grade typography.

The interface serves institutional cartographers, computational geographers, senior executives, and spatial researchers exploring planetary-scale visual models. Interaction evokes the contemplation of fine editorial print paired with the optical precision of navigational brass instrumentation. Visual density is deliberately low to allow complex vector charts, elevation models, and satellite mosaics to breathe against restrained, structured canvas boundaries.

## Colors

The palette establishes an abyss-to-mist continuum structured on deep oceanic pigments rather than synthetic greys.

- **Foundations & Backgrounds:**
  - Base Void: `#0a0f18` (Primary background, deep oceanic bathymetric black)
  - Surface Tier 1: `#0e1626` (Floating panels, spatial inspector trays)
  - Surface Tier 2: `#121c2e` (Active card surfaces, dropdown sheets)
  - Surface Tier 3: `#172338` (Hover states, nested technical inserts)

- **Typography & Content Hierarchy:**
  - Foreground Primary: `#f1f5f9` (Chalk mist; high-legibility display and narrative text)
  - Foreground Secondary: `#94a3b8` (Slate mist; metadata, coordinates, labels, body copy)
  - Foreground Tertiary: `#64748b` (Deep abyssal slate; structural dividers, disabled indices, inactive legends)

- **Accents & Instrumentation:**
  - Primary Accent: `#38bdf8` (Desaturated maritime cyan; focal interaction points, selected paths, primary vectors)
  - Secondary Accent: `#14b8a6` (Deep oceanic teal; secondary geo-polygons, status confirmations, environmental metric tags)

- **Borders & Line Work:**
  - Structural Hairlines: `rgba(148, 163, 184, 0.12)`
  - Active Hairlines: `rgba(56, 189, 248, 0.35)`
  - Inactive Troughs: `rgba(255, 255, 255, 0.04)`

Neon drop glows, high-saturation magenta, and violet gradients are categorically excluded. All overlays utilize balanced tonal shifts rather than luminous flares.

## Typography

The typographic hierarchy creates a deliberate tension between classical academia and clinical navigational precision.

- **Editorial Serifs (Newsreader):** Allocated strictly to editorial narratives, chapter introductions, project titles, and geospatial thesis statements. Large-scale headings should use light to regular weights with optical sizing enabled. It introduces the gravity of a scholarly journal.
- **Architectural Grotesque (Hanken Grotesk):** Serves as the functional reading engine. Clean, neutral, and unembellished, handling continuous narrative text, panel commentary, and descriptive metadata without competing with the map viewport.
- **Navigational Monospace (JetBrains Mono):** Dedicated to technical coordinates (lat/long), projections, elevation data, telemetry parameters, timestamps, and index scales. All numeric readouts must utilize tabular figures (`tnum`) to eliminate layout jitter during pan and zoom interactions.

## Layout & Spacing

The canvas is orchestrated around the concept of unencumbered negative space, treating geospatial visualisations as museum specimens.

- **Grid Architecture:** 
  - Desktop (1280px+): 12-column asymmetric fluid grid with `margin: 4rem` and `gutter: 2rem`. Showcase panels occupy 8 columns; analytical indices and narrative provenance balance across the remaining 4.
  - Tablet (768px - 1279px): 8-column grid with `margin: 2.5rem` and `gutter: 1.5rem`.
  - Mobile (under 768px): 4-column layout with `margin: 1.25rem` and `gutter: 1rem`. Floating overlays convert into bottom-sheet modals with maximum height constraints.

- **Rhythm & Empty Space:**
  - Vertical cadence prioritizes breathing room over compact packing. Spacing between distinct editorial narratives spans 6rem to 8rem.
  - Spatial viewports must maintain an unoccluded inner margin of at least 2rem (`space-xl`) between viewport boundaries and floating control arrays.

## Elevation & Depth

Visual hierarchy relies on calibrated luminescence, razor-thin delineation, and translucent atmospheric occlusion. Heavy drop shadows and blur-heavy consumer glass effects are rejected.

- **Surface Tiers & Hairline Framing:**
  - Ground (`#0a0f18`): Map viewport, deep sea, and root canvas.
  - Floating Layers (`#0e1626` at 85% opacity with `backdrop-filter: blur(12px)`): Inspector lenses, floating coordinate bars, and narrative captions.
  - Hairline Containment: Every surface tier is framed by a 1px border (`rgba(148, 163, 184, 0.12)`). This evokes the fine crosshair rules of drafting film and chronometer casings.
  
- **Shadow Philosophy:**
  - Shadows do not mimic organic direct sunlight. They mimic deep ocean light falloff: ambient, low-contrast, non-directional.
  - Standard floating panel elevation: `box-shadow: 0 16px 36px -12px rgba(4, 7, 13, 0.65), 0 0 0 1px rgba(148, 163, 184, 0.1)`.
  - Focused interactive elements introduce an active hairline fringe (`rgba(56, 189, 248, 0.35)`) without blooming or glowing.

## Shapes

The shape system employs minimal, clinical curvature (`roundedness: 1`), keeping edges crisp, technical, and precise.

- **Corner Radii:**
  - Small elements (inputs, tooltips, tags, buttons): `0.25rem` (`4px`).
  - Containers (showcase cards, overlays, floating HUDs): `0.5rem` (`8px`).
  - Segmented rails and grouped pills: `0.25rem` (`4px`).

Full pill geometries (e.g., `rounded-full`) are strictly reserved for circular coordinate targets, map reticles, and focal crosshairs. Curved visual metaphors must not compromise the architectural, structural discipline of the cartographic viewport.

## Components

### Buttons & Trigger Elements
- **Primary:** Dark oceanic cyan background (`#121c2e`), border `1px solid rgba(56, 189, 248, 0.4)`, text `#f1f5f9` (Hanken Grotesk Medium), hover border `#38bdf8`, subtle background illumination (`#172338`). Never solid saturated fills.
- **Ghost/Tertiary:** Transparent base, border `1px solid rgba(148, 163, 184, 0.12)`, text `#94a3b8`, hover text `#f1f5f9` with border `rgba(148, 163, 184, 0.3)`.
- **Micro-Actions / Reticles:** 32x32px square bounding containers with central icon or coordinate symbol, bordered with `rgba(148, 163, 184, 0.15)`.

### Chips & Coordinate Indicators
- Background `rgba(14, 22, 38, 0.75)`, border `1px solid rgba(148, 163, 184, 0.12)`.
- Text styled in `label-code` (JetBrains Mono, uppercase, letter-spacing `0.06em`).
- Prefix indicators are unlit desaturated dots (`#64748b`) shifting to active cyan (`#38bdf8`) or teal (`#14b8a6`) when active.

### Cards & Showcase Tiles
- Background `#0e1626` enclosed in a 1px border of `rgba(148, 163, 184, 0.12)`.
- Top-level card headers integrate a dual-line layout: archival serif title (`Newsreader`) paired with an ultra-fine tabular reference tag (`JetBrains Mono`).
- Imagery and interactive maps maintain an edge-to-edge bleed or an exact `0.5rem` structural inset with no border radius on the inner visual.

### Lists & Index Hierarchies
- Minimalist rule-divided tables. Each row is delimited by a 1px border (`rgba(255, 255, 255, 0.04)`).
- Alternate row backgrounds are prohibited; distinction is established solely through typography weight and hover luminance shifts to `#121c2e`.

### Checkboxes, Radios, & Layer Toggles
- Square or circular framing (14x14px), 1px border `rgba(148, 163, 184, 0.3)`.
- Selected state: Background transparent with a centered 6x6px geometric pip in `#38bdf8`—not a generic checkmark icon.

### Form Inputs & Spatial Filter Fields
- Background `rgba(10, 15, 24, 0.6)`, border `1px solid rgba(148, 163, 184, 0.15)`.
- Active focus state: Hairline shifts to `#38bdf8` without outer glow rings. Placeholders styled in `#64748b`.

### Specialized Showcase Components
- **Cartographic Reticle / Scale Bar:** Hairline horizontal line with vertical tick marks at intervals, accompanied by `label-code` metric descriptions (e.g., `100 KM // 1:50,000`).
- **Telemetry Scrubber:** Ultra-slim horizontal slider (2px track in `#172338`), active range `#38bdf8`, with an unobtrusive 8x8px square thumb indicator.
- **Narrative Overlay Drawer:** An editorial sidebar sliding over the canvas containing long-form `Newsreader` prose and comparative spatial layers.