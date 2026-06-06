export const TOOL_TAGS = {
  'bg-remover':              ['image', 'remove', 'background'],
  'watermark-remover':       ['image', 'remove', 'clean'],
  'watermark-remover-video': ['video', 'remove', 'clean'],
  'photo-colorize':          ['image', 'enhance', 'color'],
  'portrait':                ['image', 'enhance', 'face'],
  'clothes-swap':            ['image', 'face', 'fashion'],
  'upscaler':                ['image', 'enhance', 'quality'],
  'ps2-filter':              ['image', 'style', 'filter'],
  'voice-clone':             ['audio', 'voice'],
  'video-bg-replace':        ['video', 'remove', 'background'],
};

export const ALL_TOOLS = [
  {
    slug: 'bg-remover',
    title: 'Background Remover',
    description: 'Remove the background from any photo instantly. Get a clean transparent or custom background in seconds.',
    buttonText: 'Remove Background',
    gradient: 'from-purple-500 to-fuchsia-600',
    path: '/tools/bg-remover',
  },
  {
    slug: 'watermark-remover',
    title: 'Watermark Remover',
    description: 'Erase watermarks, logos, and text overlays from photos without any manual selection or editing skills.',
    buttonText: 'Remove Watermark',
    gradient: 'from-[#F5A623] to-[#FBCF33]',
    path: '/tools/watermark-remover',
  },
  {
    slug: 'watermark-remover-video',
    title: 'Video Watermark Remover',
    description: 'Remove watermarks and logos from videos automatically using AI — no editing software needed.',
    buttonText: 'Remove from Video',
    gradient: 'from-orange-400 to-yellow-500',
    path: '/tools/watermark-remover-video',
  },
  {
    slug: 'photo-colorize',
    title: 'Photo Colorizer',
    description: 'Bring black-and-white photos to life with realistic AI colorization in one click.',
    buttonText: 'Colorize Photo',
    gradient: 'from-blue-500 to-cyan-500',
    path: '/tools/photo-colorize',
  },
  {
    slug: 'portrait',
    title: 'AI Portrait',
    description: 'Transform your photo into a stunning AI-generated portrait with custom style and pose.',
    buttonText: 'Create Portrait',
    gradient: 'from-pink-500 to-red-500',
    path: '/tools/portrait',
  },
  {
    slug: 'clothes-swap',
    title: 'Clothes Swap',
    description: 'Virtually try on any outfit by swapping clothes on a model photo using AI.',
    buttonText: 'Swap Clothes',
    gradient: 'from-green-400 to-emerald-600',
    path: '/tools/clothes-swap',
  },
  {
    slug: 'upscaler',
    title: 'AI Upscaler',
    description: 'Upscale and enhance image resolution up to 4× without losing quality or sharpness.',
    buttonText: 'Upscale Image',
    gradient: 'from-indigo-500 to-blue-600',
    path: '/tools/upscaler',
  },
  {
    slug: 'ps2-filter',
    title: 'Game Filter',
    description: 'Turn any photo into a retro game-style image — PS2, anime, arcade, and more.',
    buttonText: 'Apply Filter',
    gradient: 'from-teal-400 to-cyan-600',
    path: '/tools/ps2-filter',
  },
  {
    slug: 'voice-clone',
    title: 'Voice Cloning',
    description: 'Clone any voice from a short audio sample and generate speech in that voice.',
    buttonText: 'Clone Voice',
    gradient: 'from-violet-500 to-purple-700',
    path: '/testing-2',
  },
  {
    slug: 'video-bg-replace',
    title: 'Video BG Replace',
    description: 'Replace the background in any video with a custom image or color using AI.',
    buttonText: 'Replace Background',
    gradient: 'from-rose-500 to-pink-600',
    path: '/tools/video-bg-replace',
  },
];

export function getRelatedTools(currentSlug, allTools, limit = 3) {
  const currentTags = TOOL_TAGS[currentSlug] || [];
  return allTools
    .filter(tool => tool.slug !== currentSlug)
    .map(tool => {
      const toolTags = TOOL_TAGS[tool.slug] || [];
      const score = toolTags.filter(tag => currentTags.includes(tag)).length;
      return { ...tool, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
