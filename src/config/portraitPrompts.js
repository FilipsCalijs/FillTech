export const BASE = `base Royal 18th century coronation portrait style, classical oil painting aesthetic, dark dramatic background with heavy draped fabric curtain in deep brown and dusty rose, stone baroque column visible on one side, warm chiaroscuro lighting, painted canvas texture, old master portrait technique like Allan Ramsay or Joshua Reynolds, highly detailed fabric and material rendering, photorealistic face seamlessly blended into painted scene`;

export const GENDER_PROMPTS = {
  Woman: `woman dressed in royal coronation regalia, grand ermine fur mantle with black tail spots, ivory and gold embroidered ceremonial gown with wide skirt, jeweled tiara or small crown atop powdered white wig with soft curls, pearl and gemstone necklace, ceremonial sash across bodice, delicate lace details at sleeves, graceful and composed regal expression`,
  Man: `man dressed in royal coronation regalia, ornate gold embroidered brocade coat with intricate floral patterns, grand ermine fur mantle with black tail spots draped over shoulders and body, large ceremonial Order chain across chest, white lace jabot at collar, pale blue ceremonial sash at waist with gold tassels, white powdered wig with curled sides, commanding yet composed regal expression`,
};

export const POSES = [
  { id: 'arms-crossed',      name: 'Arms Crossed',      image: '/pose/arms crossed.png',      prompt: '' },
  { id: 'arms-on-hips',      name: 'Arms on Hips',      image: '/pose/arms on hips.png',      prompt: '' },
  { id: 'arms-rised',        name: 'Arms Rised',        image: '/pose/arms rised.png',        prompt: '' },
  { id: 'heroitic-look',     name: 'Heroitic Look',     image: '/pose/heroitic look.png',     prompt: '' },
  { id: 'hips-on-chin',      name: 'Hips on Chin',      image: '/pose/hips on chin.png',      prompt: '' },
  { id: 'leaning-cassually', name: 'Leaning Cassually', image: '/pose/leaning cassually.png', prompt: '' },
  { id: 'looking-back',      name: 'Looking Back',      image: '/pose/looking back.png',      prompt: '' },
  { id: 'looking-view',      name: 'Looking View',      image: '/pose/looking_view.png',      prompt: '' },
  { id: 'normal-standing',   name: 'Normal Standing',   image: '/pose/normal stnading.png',   prompt: '' },
  { id: 'on-chair',          name: 'On Chair',          image: '/pose/on_chair.png',          prompt: '' },
  { id: 'raised-hand',       name: 'Raised Hand',       image: '/pose/raised hand.png',       prompt: '' },
  { id: 'three-quarter',     name: 'Three Quarter',     image: '/pose/three quarter.png',     prompt: '' },
];

export const buildPrompt = ({ gender, style, userPrompt, poseId }) => {
  const parts = [BASE, GENDER_PROMPTS[gender] ?? GENDER_PROMPTS.Woman];

  if (userPrompt?.trim()) parts.push(userPrompt.trim());

  const pose = POSES.find(p => p.id === poseId);
  if (pose) parts.push(pose.prompt);

  return parts.join(', ');
};
