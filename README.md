# PARALLAX

Generative axonometric compositions in the browser.

**Live:** _(add link once this repo is connected to Netlify)_

## What it is

A seeded, deterministic generator of extruded volumes floating in
ambiguous 3D space, in the spirit of El Lissitzky's Proun plates —
no single fixed vanishing point, no consistent depth axis across every
form. Sibling tool to [KONSTRUKTOR](https://randompatterngeneratorv1.netlify.app),
which generates the flat 2D counterpart; PARALLAX is the true-3D
extension, rendered with a real orthographic camera you can orbit
rather than a fixed projection.

Every composition is reproducible from its seed — same seed, density,
and chaos always produce the same arrangement of volumes.

Four shape families make up a composition:

- **Rect** — panels, mostly near-axis with occasional tilt
- **Beam** — long thin rods, free rotation, crossing the composition
  diagonally
- **Wedge** — irregular triangular slivers, free rotation
- **Disk** — flat n-gons with no extrusion depth

## Controls

- **Seed** — set directly, or randomized via Auto-generate
- **Density** — number of volumes
- **Chaos** — the tool's signature parameter. At 0, every volume's
  extrusion direction agrees, reading as a coherent isometric scene.
  Turned up, volumes increasingly diverge onto a different world axis
  than the rest of the composition — genuine 3D ambiguity, not a
  projection trick — producing the multi-viewpoint read real Proun
  plates have.
- **Palette** — four variants (classic, steel, olive, mono), reused
  from KONSTRUKTOR's Proun-mode palette. Fill colors are only ever
  drawn from three of a palette's four colors — the fourth is reserved
  for outlines.
- **Recolor** — reassigns face colors and palette without touching the
  underlying geometry
- **Auto-generate** — cycles through new compositions on a timer
- **Auto-Orbit** — slow turntable rotation of the camera; freezes the
  instant you manually drag, so it never fights your input
- **View presets** — Iso, Front, Back, Left, Right, Top. The five
  orthogonal views are true elevations/plan, not just camera angles
- **Reset View** — returns to the default Iso framing
- **Save PNG** — export the current view as a still

## Tech

Single-file HTML/CSS/JS, no build step. Deterministic output via a
seeded PRNG (mulberry32). Rendering is a real Three.js scene — an
`OrthographicCamera` (no perspective distortion, which is what keeps
the axonometric read intact under free orbit) with `OrbitControls`,
volumes built from `ExtrudeGeometry`, flat shading from a simple
ambient + directional light setup. Camera framing auto-fits to
whatever the composition actually contains, so nothing clips past the
frustum edge regardless of density or how far a beam extends.

Three.js and OrbitControls load from a CDN (unpkg) at runtime — this
is the one tool in the suite with an external dependency; everything
else here is fully self-contained.

Deploys straight from this repo — no build command needed, publish
directory is the repo root (`netlify.toml` included).

## Changelog

See the comment block at the top of `index.html` for the full version
history. Bump `APP_VERSION` in the script and add a line there with
each change, same convention used across the other tools in this
ecosystem — including UI-only changes.

---
Joe.K · [axisbim.io](https://axisbim.io)
