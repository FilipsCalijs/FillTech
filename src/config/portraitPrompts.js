export const BASE = `base Royal 18th century coronation portrait style, classical oil painting aesthetic, dark dramatic background with heavy draped fabric curtain in deep brown and dusty rose, stone baroque column visible on one side, warm chiaroscuro lighting, painted canvas texture, old master portrait technique like Allan Ramsay or Joshua Reynolds, highly detailed fabric and material rendering, photorealistic face seamlessly blended into painted scene`;

export const GENDER_PROMPTS = {
  Woman: `woman dressed in royal coronation regalia, grand ermine fur mantle with black tail spots, ivory and gold embroidered ceremonial gown with wide skirt, jeweled tiara or small crown atop powdered white wig with soft curls, pearl and gemstone necklace, ceremonial sash across bodice, delicate lace details at sleeves, graceful and composed regal expression`,
  Man: `man dressed in royal coronation regalia, ornate gold embroidered brocade coat with intricate floral patterns, grand ermine fur mantle with black tail spots draped over shoulders and body, large ceremonial Order chain across chest, white lace jabot at collar, pale blue ceremonial sash at waist with gold tassels, white powdered wig with curled sides, commanding yet composed regal expression`,
};

export const POSES = [
  {
    id: 'three-quarter',
    name: 'Three-quarter',
    image: 'https://placehold.co/300x300',
    prompt: `pose: three-quarter body portrait, subject turned slightly to the left, weight resting on one arm on a surface, face looking directly at the viewer, upright and composed posture`,
  },
];

export const buildPrompt = ({ gender, style, userPrompt, poseId }) => {
  const parts = [BASE, GENDER_PROMPTS[gender] ?? GENDER_PROMPTS.Woman];

  if (userPrompt?.trim()) parts.push(userPrompt.trim());

  const pose = POSES.find(p => p.id === poseId);
  if (pose) parts.push(pose.prompt);

  return parts.join(', ');
};
