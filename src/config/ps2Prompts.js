export const PS2_STYLES = [
  {
    id: 'arcade',
    name: 'Arcade',
    image: 'https://placehold.co/300x200',
    prompt: `Arcade era (1985-1995) video game screenshot, pixel art sprites, chunky 16-bit pixel grid, limited color palette 32-64 colors, flat 2D side-scrolling or isometric perspective, hard pixel edges, scanline pattern, dithering in shadows and gradients, bright saturated primary colors, crisp sprite outlines, retro HUD elements, tile-based background, style of Metal Slug, Streets of Rage, Contra, Final Fight, keep original scene composition and subjects unchanged`,
  },
  {
    id: '8bit',
    name: '8-bit',
    image: 'https://placehold.co/300x200',
    prompt: `NES 8-bit era (1983-1991) video game screenshot, chunky pixel art, strict 4-color palette per sprite, NES color palette limitations, hard blocky pixels 8x8 tile grid, flat 2D side-scrolling perspective, no gradients only solid flat colors, visible pixel squares, dithering patterns, simple sprite outlines, tile-based repeating background, retro chiptune visual style, style of Contra, Battletoads, Mega Man, Castlevania, Super Mario Bros, keep original scene subjects and composition unchanged`,
  },
  {
    id: 'ps2',
    name: 'PS2',
    image: 'https://placehold.co/300x200',
    prompt: `Transform this room into a PlayStation 2 era (2000-2005) video game screenshot, low-polygon geometry, blocky 256x512 pixelated textures, flat pre-baked lighting with no real-time shadows, muddy desaturated color palette with color banding, heavy aliased edges, CRT scanline overlay, grainy noise in dark areas, foggy draw distance clipping in background, vertex wobble on edges, bloom artifacts around light sources, gritty washed-out atmosphere, style of GTA San Andreas, Tomb Raider Legend, Silent Hill 2, Resident Evil 4`,
  },
  {
    id: 'vhs',
    name: 'VHS',
    image: 'https://placehold.co/300x200',
    prompt: `VHS tape recording aesthetic (1980s-1990s), analog video distortion, horizontal tracking lines, color bleeding and smearing, washed-out faded colors, low contrast muddy tones, interlaced scan lines, slight vertical hold instability, chroma shift with red and blue channel separation, white noise grain overlay, soft blurry edges, magnetic tape degradation artifacts, fuzzy text edges, muted desaturated palette with slightly boosted reds, home video camcorder look, keep original scene composition and subjects completely unchanged`,
  },
  {
    id: 'ps3',
    name: 'PS3',
    image: 'https://placehold.co/300x200',
    prompt: `Xbox 360 PlayStation 3 era (2005-2013) video game screenshot, seventh generation console graphics, real-time dynamic shadows and ambient occlusion, specular highlights on surfaces, normal mapped textures with visible bump detail, slightly over-sharpened edges, bloom lighting on bright surfaces, muted military-brown-grey color grading, HDR lighting baked into scene, medium resolution textures with visible compression artifacts up close, screen space reflections, characteristic early motion blur, slight depth of field on background, style of Gears of War, Call of Duty Modern Warfare, Assassins Creed 2, Uncharted 2, keep original scene composition and subjects completely unchanged`,
  },
  {
    id: 'modern',
    name: 'Modern',
    image: 'https://placehold.co/300x200',
    prompt: `modern AAA video game screenshot (2020-2025), photorealistic graphics, ray traced global illumination, path traced reflections and shadows, ultra high resolution 4K textures with fine surface detail, physically based rendering materials, subsurface scattering on organic surfaces, volumetric lighting and god rays, realistic ambient occlusion, screen space reflections, realistic depth of field, natural color grading with cinematic LUT, hyper detailed geometry, realistic fabric and material simulation, style of The Last of Us Part 2, Cyberpunk 2077, Alan Wake 2, Red Dead Redemption 2, keep original scene composition and subjects completely unchanged`,
  },
];

export const buildPs2Prompt = ({ styleId }) => {
  const style = PS2_STYLES.find(s => s.id === styleId) ?? PS2_STYLES[2];
  return style.prompt;
};
