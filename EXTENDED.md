# PARALLAX — extended notes

## What it is

A seeded, deterministic generator of extruded volumes floating in
ambiguous 3D space, in the spirit of El Lissitzky's Proun plates —
no single fixed vanishing point, no consistent depth axis across every
form. PARALLAX renders with a real orthographic camera you can orbit,
rather than a fixed 2D projection.

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

## A note on Three.js r128 + OrbitControls

`camera.up` cannot be reassigned after `OrbitControls` is constructed —
r128 caches the up-axis quaternion once, at construction, and never
re-reads it. The Top view preset works around the resulting pole
singularity (azimuth is undefined exactly at x=0, z=0) with a tiny
epsilon offset on the camera position instead of touching `camera.up`.
Worth remembering if this ever gets upgraded to a newer Three.js
version, since that constraint may not hold in future releases.
