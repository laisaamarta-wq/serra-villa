// All editable content for the SERRA site: media, copy and verified property facts.
// Serra is a concept property. Every fact below comes from the original concept;
// nothing here is a real listing, price or availability.

const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3C15E03naKYn0k12cqxNShlIybX/';
const u = (id, ext = 'webp') => `${CDN}${id}.${ext}`;

export const MEDIA = {
  studio: u('bf9f0e23-8548-4397-a428-56177eadcd2e'),
  s0: u('7ca677f9-9440-41aa-9110-d000e28f54b5'),
  master: u('9113bcd8-9a90-4603-8253-56ce21bc4680'),
  reveal: u('40171492-a905-444f-ba96-ea2d01777131'),
  day: u('a7f5d3c7-352e-452c-9df5-d9f56f33d32c'),
  night: u('397d5d99-4243-4127-afb6-cba2bc2b7bce'),
  living: u('6bb6d1ea-b9da-46fc-a0dd-938381f52d4e'),
  kitchen: u('c4cc06a0-e5b0-4ded-afcb-db5e418ef38c'),
  pergola: u('b6dc7df7-ecba-4b52-9cee-a4038ba4d620'),
  bedroom: u('6461c16e-b0fd-4ab1-852e-8b2852d8261a'),
  bath: u('035e3feb-55e3-46ed-9fb6-3fd2897fd465'),
  garden: u('e7a2a7be-62cf-4b28-a7ae-e99955ac8da2'),
  matTravertine: u('b5914c53-8ede-43d4-8684-45a474e73532'),
  matOak: u('bdf89346-3571-45e6-9bae-a3b3e54fdadd'),
  matLinen: u('bb614efd-c32a-4c80-9f06-6d25fec29c95'),
  matWater: u('5c89cba5-1b82-4d3e-9c89-64c2a016a891'),
  // a frame of the walk-through: the lit stair from the entrance hall down to the living floor
  stair: u('548daae7-d5e5-41e7-86e4-39f5e8c5c442', 'jpg'),
  // aerial film for the location chapter: approaches the villa and pulls away again
  hero: {
    desktop: u('469f8d69-ebc6-4c69-919e-525342a976f7', 'mp4'),
    mobile: u('3ba65265-8fa1-4348-b116-b54d95fdc576', 'mp4'),
    poster: u('4cc25c34-2537-4b89-b083-2a4d61f2722f', 'jpg'),
    posterMobile: u('9673ec20-6339-4635-8596-275e7d23ce53', 'jpg'),
  },
  // the walk-through film opens the site (drone artefact over the pool removed at 26.6–27.2 s)
  walk: {
    desktop: u('13572a40-121b-4be5-83cd-86017e1ac895', 'mp4'),
    mobile: u('1e45bb3a-5182-432e-9e50-3439a12ad7ff', 'mp4'),
  },
  making: {
    desktop: u('920dc112-7ef9-471c-9f51-fd7cbc8b81c8', 'mp4'),
    mobile: u('19390fa8-7b31-4fff-8e08-85b3e9579868', 'mp4'),
  },
};

// Verified concept facts. `count` animates once; `suffix` is set in smaller type.
export const SPECS = [
  { label: 'Interior', count: 420, suffix: 'm²' },
  { label: 'Suites', count: 4 }, // as drawn on the plan: master suite, suite, two guest suites
  { label: 'Levels', count: 2 },
  { label: 'Infinity pool', count: 28, suffix: 'm' },
  { label: 'Garden', count: 3800, suffix: 'm²', group: true },
  { label: 'Above the sea', count: 140, suffix: 'm' },
];

// Walk-through film chapters (seconds in the 30 s film).
export const WALK = [
  { t: 0, name: 'Arrival' },
  { t: 3, name: 'Pool terrace' },
  { t: 6, name: 'Living room' },
  { t: 9.5, name: 'Kitchen' },
  { t: 13, name: 'The stair' },
  { t: 16.6, name: 'Master suite' },
  { t: 21, name: 'Pergola' },
  { t: 24.6, name: 'The view' },
];

// Construction visualisation: stage `t` is the moment in the 20 s film where the stage is complete.
export const MAKING = [
  { t: 0, name: 'The Ground', text: 'The ridge as it was found: pines, limestone and wild rosemary above the bay. The plan keeps the slope exactly as it is.' },
  { t: 5, name: 'The Foundation', text: 'Terraces are cut into the hillside and the foundations follow its contours, so the house sits in the slope rather than on it.' },
  { t: 10, name: 'The Structure', text: 'Two long concrete levels rise under one thin roof slab, reaching toward the view.' },
  { t: 15, name: 'The Craft', text: 'Honed travertine is laid on the walls and floors, and wide panes of glass are set into every opening that faces the bay.' },
  { t: 20.1, name: 'The Residence', text: 'The pool fills to its edge, the garden is planted around the old olive trees, and the house meets its first golden hour.' },
];

// Photographs linked to rooms on the plan (keys of MEDIA).
export const ROOM_PHOTOS = {
  entry: { key: 'stair', name: 'The stair down to the living floor', detail: 'the stair down to the living floor' },
  living: { key: 'living', name: 'Living room' },
  kitchen: { key: 'kitchen', name: 'Kitchen and dining' },
  master: { key: 'bedroom', name: 'Master suite' },
  masterbath: { key: 'bath', name: 'Bath' },
  pergola: { key: 'pergola', name: 'Pergola terrace' },
  poolterrace: { key: 'day', name: 'Pool terrace' },
};

// Materials shown where they are used (`context`), with a close-up sample (`key`).
export const MATERIALS = [
  { key: 'matTravertine', context: 'living', name: 'Travertine', where: 'Living room wall and floor', text: 'Honed, never polished. Floors, walls and the pool edge are cut from the same quarry, so the stone runs unbroken from the living room to the water.' },
  { key: 'matOak', context: 'pergola', name: 'Oak', where: 'Pergola and terrace', text: 'Oiled by hand for the pergola, the doors and the kitchen. It greys softly in the sun.' },
  { key: 'matLinen', context: 'bedroom', name: 'Linen', where: 'Master suite', text: 'Washed linen on every sofa and curtain, so the house stays cool in August.' },
  { key: 'matWater', context: 'day', name: 'Water', where: 'Pool terrace', text: 'A 28-metre edge that spills over the stone and seems to run into the bay.' },
];

// Places near Serra, from the concept brief. Kept as data; the page now mentions them in one line
// in the location chapter and the airport time in the stay section.
export const PLACES = [
  { id: 'serra', place: 'Serra', how: 'At the end of a private road, 140 m above the water', at: [298, 342] },
  { id: 'cove', place: 'Swimming cove', how: '600 m on a stone path', at: [176, 436] },
  { id: 'village', place: 'Village and harbour', how: '1.2 km, ten minutes by bicycle', at: [522, 262] },
  { id: 'marina', place: 'Marina', how: '2.5 km', at: [560, 246] },
  { id: 'airport', place: 'International airport', how: '45 minutes by car', at: null },
];

// Floor plan, drawn at 28 units per metre; areas are computed from the geometry.
export const PLAN = {
  terrace: {
    title: 'Terrace level',
    summary: 'Entrance from the hill, the master suite and the pergola terrace.',
    rooms: [
      { id: 'entry', name: 'Entrance hall', x: 120, y: 140, w: 140, h: 220, text: 'The door opens from the olive garden straight onto the view, with a stair down to the living floor.' },
      { id: 'study', name: 'Study', x: 260, y: 140, w: 120, h: 110, text: 'A quiet room on the hill side, lit from a high strip window.' },
      { id: 'suite2', name: 'Suite', x: 260, y: 250, w: 120, h: 110, text: 'A guest suite with its own shower and a door to the terrace.' },
      { id: 'master', name: 'Master suite', x: 380, y: 140, w: 240, h: 220, text: 'Bedroom and sitting area behind a single sliding glass wall.' },
      { id: 'masterbath', name: 'Dressing and bath', x: 620, y: 140, w: 140, h: 220, text: 'Walk-in dressing room and the stone bath facing the pines.' },
      { id: 'pergola', name: 'Pergola terrace', x: 120, y: 360, w: 640, h: 160, outdoor: true, text: 'Outdoor dining under the slatted oak pergola, above the pool.' },
    ],
  },
  pool: {
    title: 'Pool level',
    summary: 'Living room, kitchen, two guest suites and the pool terrace.',
    rooms: [
      { id: 'living', name: 'Living room', x: 80, y: 120, w: 340, h: 210, text: 'Open on two sides to the pool terrace, with the linear fireplace on the stone wall.' },
      { id: 'kitchen', name: 'Kitchen and dining', x: 420, y: 120, w: 200, h: 210, text: 'Travertine island, oak table for twelve, pantry behind.' },
      { id: 'guest1', name: 'Guest suite', x: 620, y: 120, w: 200, h: 105, text: 'Sea-facing bedroom with shower room.' },
      { id: 'guest2', name: 'Guest suite', x: 620, y: 225, w: 200, h: 105, text: 'Sea-facing bedroom with shower room.' },
      { id: 'poolterrace', name: 'Pool terrace', x: 80, y: 330, w: 820, h: 230, outdoor: true, text: 'Travertine terrace with loungers and the 28-metre infinity pool at the cliff edge.' },
    ],
    pool: { x: 104, y: 430, w: 784, h: 90 },
  },
};
