export const PS2_STYLES = [
  {
    id: 'arcade',
    name: 'Arcade',
    image: '/eras/moniken/arcade.png',
    prompt: `Convert this image into a 1990s arcade game screenshot, bright saturated pixel art, chunky 16-bit sprite style, hard pixel edges with no anti-aliasing, bold black outlines around all subjects and objects, limited color palette with strong primaries, flat cel-like shading, visible scanline overlay, dithering in gradients and shadows, tile-based repeating background elements, high contrast vivid colors, style of Metal Slug, King of Fighters, Final Fight, subject and scene layout must remain identical, only visual style changes`,
  },
  {
    id: '8bit',
    name: '8-bit',
    image: '/eras/moniken/8-bit.png',
    prompt: `Convert this image into a NES Famicom 8-bit game screenshot, extremely chunky blocky pixels, strict 4 colors per tile zone, flat solid colors with zero gradients, visible 8x8 pixel tile grid across entire image, simple geometric shapes replacing all fine detail, hard pixel staircase edges on all curves, characteristic NES color palette only, horizontal scanlines, style of Super Mario Bros, Mega Man, Castlevania, Contra, subject and scene layout must remain identical, only visual style changes`,
  },
  {
    id: '16bit',
    name: '16-bit',
    image: '/eras/moniken/16-bit.png',
    prompt: `Convert this image into a SNES Sega Genesis 16-bit game screenshot, detailed pixel art with 256 color palette, smooth dithering gradients in sky and shadows, parallax layered background, rich saturated colors, visible pixel grid, characteristic 16-bit color banding, detailed sprite shading with highlight and shadow pixels, tile-based environment with clear pixel seams, style of Chrono Trigger, Street of Rage 2, Final Fantasy VI, Sonic the Hedgehog, subject and scene layout must remain identical, only visual style changes`,
  },
  {
    id: 'ps2',
    name: 'PS2',
    image: '/eras/moniken/ps2.png',
    prompt: `Convert this image into a PlayStation 2 era game screenshot, low polygon count geometry with visible facets, blocky compressed textures at 256x256 resolution, flat pre-baked lighting with no dynamic shadows, muddy desaturated color grading, strong color banding in gradients, hard aliased edges with no anti-aliasing, grainy noise in all dark areas, foggy draw distance cutting off background depth, characteristic PS2 color palette, style of GTA San Andreas, Tomb Raider Legend, Silent Hill 2, subject and scene layout must remain identical, only visual style changes`,
  },
  {
    id: 'ps3',
    name: 'PS3',
    image: '/eras/moniken/ps3.png',
    prompt: `Convert this image into a PlayStation 3 Xbox 360 era game screenshot, seventh generation real-time graphics, dynamic shadows with ambient occlusion, specular gloss highlights on all surfaces, normal mapped bump detail visible on textures, slightly over-sharpened crisp edges, muted desaturated brown grey military color grading, medium resolution textures with subtle compression artifacts, early screen space reflections, characteristic bloom on bright areas, slight motion blur, style of Gears of War, Call of Duty Modern Warfare, Uncharted 2, subject and scene layout must remain identical, only visual style changes`,
  },
  {
    id: 'anime',
    name: 'Anime',
    image: '/eras/moniken/anime.png',
    prompt: `Convert this image into a 1990s 2000s Japanese anime screenshot, clean bold black outlines on all subjects and edges, flat cel shaded colors with no photorealistic gradients, classic anime color palette vivid and saturated, painterly hand drawn background art with visible brush texture, dramatic anime sky with stylized clouds, strong contrast between light and shadow with sharp terminator line, simplified facial features in anime style, characteristic anime speedlines and depth of field blur on background, style of Ghost in the Shell, Cowboy Bebop, Akira, Berserk, subject and scene layout must remain identical, only visual style changes`,
  },
  {
    id: 'aaa',
    name: 'AAA',
    image: '/eras/moniken/aaa.png',
    prompt: `Convert this image into a modern AAA video game screenshot 2020 to 2025, full ray traced global illumination with realistic light bouncing, path traced soft shadows with accurate penumbra, ultra high resolution physically based rendering textures with fine surface microdetail, subsurface scattering on skin and organic materials, volumetric atmospheric fog and god rays, realistic screen space reflections on all surfaces, natural cinematic color grading with subtle LUT, hyper detailed geometry on all objects, realistic fabric simulation and material response, style of The Last of Us Part 2, Cyberpunk 2077, Alan Wake 2, Red Dead Redemption 2, subject and scene layout must remain identical, only visual style changes`,
  },
];

export const buildPs2Prompt = ({ styleId }) => {
  const style = PS2_STYLES.find(s => s.id === styleId) ?? PS2_STYLES[2];
  return style.prompt;
};
