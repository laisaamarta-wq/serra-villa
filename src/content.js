// All editable content for the SERRA site lives here: media, journey timing, copy.
// Media are hosted on the Higgsfield CDN (CORS-enabled). Replace URLs to self-host.

const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3C15E03naKYn0k12cqxNShlIybX/';
const u = (id, ext = 'webp') => `${CDN}${id}.${ext}`;

export const MEDIA = {
  studio: u('bf9f0e23-8548-4397-a428-56177eadcd2e'),
  s0: u('7ca677f9-9440-41aa-9110-d000e28f54b5'),
  wireLines: u('9740928f-bc0a-4751-baa4-f49f7b9fbc96'),
  s1: u('b7728d62-6957-4d88-9520-d231ef13f790'),
  s2: u('3587778f-df1b-4c9a-8355-33ff501e60f3'),
  s3: u('124abd6b-da95-4ec3-8ba0-2db4dbc08850'),
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
  film: {
    desktop: u('1e15b776-b73a-4e7f-9526-c746dd1a89b8', 'mp4'), // 1600×900, keyframe every 8 frames
    mobile: u('00080901-ae94-4a56-a8d2-d06b0b0c1480', 'mp4'), // 1280×720
    duration: 30.0,
  },
};

/*
  The journey is one pinned stage. Distances are in viewport heights (vh units of scroll).
  Each beat maps its own scroll interval to its own visual interval.
  - studio: 0..1 draws the hologram plan over the studio photo
  - zoom: pushes into the hologram and dissolves to the empty site
  - build: `from`/`to` are stage indices (0 = empty slope … 5 = finished villa)
  - film: `from`/`to` are seconds of the fly-through video; a hold has from === to
  `focus` is the horizontal crop focus on portrait screens (0 left … 1 right).
  `mvh` optionally overrides the distance on phones.
*/
export const BEATS = [
  { id: 'studio', type: 'studio', vh: 1.3, mvh: 1.0 },
  { id: 'zoom', type: 'zoom', vh: 0.8, mvh: 0.6 },
  { id: 'site', type: 'build', from: 0, to: 0, vh: 0.6, mvh: 0.4 },
  { id: 'line', type: 'build', from: 0, to: 1, vh: 0.8, mvh: 0.6 },
  { id: 'foundation', type: 'build', from: 1, to: 2, vh: 0.8, mvh: 0.6 },
  { id: 'structure', type: 'build', from: 2, to: 3, vh: 0.8, mvh: 0.6 },
  { id: 'stone', type: 'build', from: 3, to: 4, vh: 0.8, mvh: 0.6 },
  { id: 'water', type: 'build', from: 4, to: 5, vh: 0.8, mvh: 0.6 },
  { id: 'finished', type: 'film', from: 0, to: 0, vh: 0.9, mvh: 0.6, focus: 0.42 },
  { id: 'dive', type: 'film', from: 0, to: 3.0, vh: 1.0, mvh: 0.8, focus: 0.45 },
  { id: 'pool', type: 'film', from: 3.0, to: 6.0, vh: 1.1, mvh: 0.9, focus: 0.5 },
  { id: 'living', type: 'film', from: 6.0, to: 9.5, vh: 1.8, mvh: 1.3, focus: 0.45 },
  { id: 'kitchen', type: 'film', from: 9.5, to: 13.0, vh: 1.8, mvh: 1.3, focus: 0.4 },
  { id: 'stairs', type: 'film', from: 13.0, to: 16.6, vh: 1.2, mvh: 0.9, focus: 0.35 },
  { id: 'bedroom', type: 'film', from: 16.6, to: 21.0, vh: 1.8, mvh: 1.3, focus: 0.45 },
  { id: 'pergola', type: 'film', from: 21.0, to: 24.6, vh: 1.3, mvh: 1.0, focus: 0.45 },
  { id: 'turn', type: 'film', from: 24.6, to: 26.6, vh: 0.9, mvh: 0.7, focus: 0.5 },
  { id: 'reveal', type: 'film', from: 26.6, to: 30.0, vh: 1.8, mvh: 1.3, focus: 0.55 },
  { id: 'end', type: 'film', from: 30.0, to: 30.0, vh: 0.8, mvh: 0.5, focus: 0.55 },
];

// Copy chapters: shown while the scroll is between the start of `from` beat and the end of `to` beat.
export const CHAPTERS = [
  { from: 'studio', to: 'studio', place: 'center', title: ['Every house', 'begins as a line'], body: 'Serra was drawn for one ridge above the sea, and for nothing else.' },
  { from: 'site', to: 'site', place: 'left', title: ['A ridge above', 'the bay'], body: 'Pines, limestone and wild rosemary. The plan keeps the slope exactly as it was found.' },
  { from: 'finished', to: 'dive', place: 'left', title: ['Serra'], body: 'A house grown from the hillside.', cta: { label: 'Request a viewing', href: '#viewing' }, hero: true },
  { from: 'living', to: 'living', place: 'right', title: ['Space follows', 'the light'], body: 'The living floor opens on two sides, so the room is never far from the water.' },
  { from: 'kitchen', to: 'kitchen', place: 'left', title: ['A table for twelve,', 'a step from the pool'], body: 'One block of travertine for the island, oak for everything the hands touch.' },
  { from: 'bedroom', to: 'bedroom', place: 'right', title: ['Evenings end', 'over the bay'], body: 'The master suite faces the sunset, behind one sliding wall of glass.' },
  { from: 'reveal', to: 'end', place: 'left', title: ['The view was', 'designed first'], body: '420 m² on two levels, five suites, a 28-metre pool at the edge of the cliff.', cta: { label: 'Explore the house', href: '#house' } },
];

export const STAGES = [
  { beat: 'line', name: 'The line' },
  { beat: 'foundation', name: 'Foundation' },
  { beat: 'structure', name: 'Structure' },
  { beat: 'stone', name: 'Stone and glass' },
  { beat: 'water', name: 'Water and garden' },
];

export const SPACES = [
  { key: 'living', name: 'Living room', text: 'Ninety square metres under one thin concrete roof, with a linear fireplace set into the travertine wall. Both glass walls slide away into the stone.' },
  { key: 'kitchen', name: 'Kitchen and dining', text: 'A single block of travertine for the island and a long oak table for twelve, a step from the terrace.' },
  { key: 'pergola', name: 'Pergola terrace', text: 'Slatted oak overhead draws moving stripes of shade across the floor from noon until sunset.' },
  { key: 'bedroom', name: 'Master suite', text: 'The bed faces the bay, so the last light of the day arrives through the olive branches and the linen curtain.' },
  { key: 'bath', name: 'Bath', text: 'A tub carved from one piece of stone, set where the pines frame the water.' },
  { key: 'garden', name: 'Garden', text: 'Old olive trees kept in place during construction, with limestone steps laid by hand between them.' },
];

export const MATERIALS = [
  { key: 'matTravertine', name: 'Travertine', text: 'Honed, never polished. Floors, walls and the pool edge are cut from the same quarry.' },
  { key: 'matOak', name: 'Oak', text: 'Oiled by hand for the pergola, the doors and the kitchen. It greys softly in the sun.' },
  { key: 'matLinen', name: 'Linen', text: 'Washed linen on every sofa and curtain, so the house stays cool in August.' },
  { key: 'matWater', name: 'Water', text: 'A 28-metre edge that spills over the stone and seems to run into the bay.' },
];

export const DISTANCES = [
  { place: 'Swimming cove', how: '600 m on a stone path' },
  { place: 'Village and harbour', how: '1.2 km, ten minutes by bicycle' },
  { place: 'Marina', how: '2.5 km' },
  { place: 'International airport', how: '45 minutes by car' },
];

// Floor plan. Coordinates in a 1000 × 620 drawing at 28 units per metre; areas are computed from the geometry.
export const PLAN = {
  terrace: {
    title: 'Terrace level',
    summary: 'Entrance from the hill, master suite and the pergola terrace',
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
    summary: 'Living, kitchen, two guest suites and the pool terrace',
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
