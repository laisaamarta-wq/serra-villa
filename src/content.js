// All editable content for the SERRA site: media, copy and verified property facts.
// Serra is a concept property. Every fact below comes from the original concept;
// nothing here is a real listing, price or availability.

const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3C15E03naKYn0k12cqxNShlIybX/';
const u = (id, ext = 'webp') => `${CDN}${id}.${ext}`;

export const MEDIA = {
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
  // the four rooms the film does not pass through, rendered to match the photographs above
  study: u('a16066d4-7127-4a1d-952a-61825378646d'),
  suite: u('828c5f91-45d0-4ceb-8894-9ba9c19e4b62'),
  guest1: u('94c4d7e7-b503-42cf-baa4-fa19c108382d'),
  guest2: u('f6e99113-e490-4346-828b-cfb2ed1e753a'),
  // views from the walk-through film, re-rendered as sharp 2400 px photographs (same framing as the film)
  stair: u('fce1b988-fdef-466b-8740-c11d4668b5db'), // the lit stair from the entrance hall
  pergolaTable: u('3ef90441-897b-4e29-9ff0-3979b1d802a2'), // the long table under the pergola
  poolEdge: u('e879393c-e1c2-4c1c-a552-d9e4927915ab'), // the pool at the level of the terrace
  bay: u('14507a27-9e86-4d3d-af05-2b5861b68389'), // the bay below the pool terrace
  // social sharing preview (1200 x 630)
  og: u('ac0a81d0-b534-4f79-ba93-4a38dbceb0f8', 'jpg'),
  // aerial film for the location chapter: approaches the villa and pulls away again
  hero: {
    desktop: u('469f8d69-ebc6-4c69-919e-525342a976f7', 'mp4'),
    mobile: u('3ba65265-8fa1-4348-b116-b54d95fdc576', 'mp4'),
    poster: u('4cc25c34-2537-4b89-b083-2a4d61f2722f', 'jpg'),
    posterMobile: u('9673ec20-6339-4635-8596-275e7d23ce53', 'jpg'),
  },
  // the walk-through film opens the site (stray drone artefacts removed: 21.5–23.5 s on the terrace, 26.6–27.2 s over the pool)
  walk: {
    desktop: u('a541291c-b778-4cd7-9207-ced4c57997d6', 'mp4'),
    mobile: u('f357428e-e898-4a2a-8d9d-a44a9b83b27e', 'mp4'),
  },
  // construction visualisation (letterbox removed; 1440 px for desktop, 960 px for phones)
  making: {
    desktop: u('2d949888-dce0-4260-87ff-286df005a492', 'mp4'),
    mobile: u('3a61c9bf-af56-4c58-b898-a9020673fa70', 'mp4'),
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
  study: { key: 'study', name: 'Study, lit from the high strip window' },
  suite2: { key: 'suite', name: 'Suite, with its door to the pergola terrace' },
  living: { key: 'living', name: 'Living room' },
  kitchen: { key: 'kitchen', name: 'Kitchen and dining' },
  guest1: { key: 'guest1', name: 'Guest suite, facing the pool and the bay' },
  guest2: { key: 'guest2', name: 'Guest suite, with its stone shower room' },
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

// ---------------- Location ----------------
// Serra is a concept property and its real-world location has not been confirmed.
// Nothing destination-specific is published until `confirmed` is true: fill in the region,
// country and the nearby places (with checked distances), then set `confirmed: true`.
export const LOCATION = {
  confirmed: false,
  coast: 'Mediterranean',
  region: '', // e.g. 'Amalfi Coast'
  country: '', // e.g. 'Italy'
  locality: '', // optional: the nearest town, if it is safe to publish
  setting: 'A wooded ridge above a sheltered bay, 140 m above the water',
  access: 'At the end of a private road',
  disclosure: 'Shared with guests once a stay is confirmed',
  // shown only when `confirmed` is true; these were concept placeholders and must be checked
  nearby: [
    { place: 'Swimming cove', how: '600 m on a stone path' },
    { place: 'Village and harbour', how: '1.2 km' },
    { place: 'Marina', how: '2.5 km' },
    { place: 'International airport', how: '45 minutes by car' },
  ],
};

// What the aerial photograph shows, marked on it. Positions are % of the image (x, y).
// These describe the picture, not a map: no distances or directions are implied.
export const SETTING_MARKS = [
  { x: 35, y: 52, name: 'The house', text: 'Two long travertine levels set into the slope, every room facing the water.' },
  { x: 44, y: 66, name: 'The pool terrace', text: 'The 28-metre pool runs out to where the cliff begins.' },
  { x: 14, y: 78, name: 'Pines and olives', text: 'The hillside was kept as it was found; the garden grows into it.' },
  { x: 68, y: 38, name: 'The village across the bay', text: 'White houses on the far shore, in view from the terraces.' },
  { x: 80, y: 47, name: 'The harbour', text: 'Boats moored in the curve of the bay below the village.' },
  { x: 47, y: 9, name: 'The mountains behind', text: 'A wall of hills closes the view inland and shelters the house.' },
];

// A day at Serra, told through rooms that face the light at different hours.
export const RHYTHM = [
  { when: 'Morning', key: 'bath', name: 'The stone bath', text: 'A tub carved from one piece of stone, set where the pines frame the water.', alt: 'The stone bath, open to the pines and the sea' },
  { when: 'Midday', key: 'garden', name: 'The olive garden', text: 'Old olive trees kept in place during construction, with limestone steps laid by hand between them.', alt: 'Olive trees and hand-laid limestone steps in the garden' },
  { when: 'Afternoon', key: 'poolEdge', name: 'The long pool', text: 'The water lies level with the travertine, so a swim runs straight toward the bay.', alt: 'The infinity pool level with the travertine terrace' },
  { when: 'Evening', key: 'pergolaTable', name: 'Under the pergola', text: 'The long oak table on the upper terrace, as the light turns gold over the bay.', alt: 'The long dining table under the slatted oak pergola at sunset' },
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
