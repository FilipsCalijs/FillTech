// Cost per generation in USD. Update when real prices are known.
export const TOOL_PRICES = {
  'portrait':              0.00,
  'ps2-filter':            0.00,
  'watermark-remove':      0.00,
  'bg-remove':             0.00,
  'photo-colorize':        0.00,
  'voice-clone':           0.00,
  'clothes-swap':          0.00,
  'video-watermark-remove': 0.00,
  'video-bg-replace':      0.00,
  'vocal-isolator':        0.00,
  'pdf-extract':           0.00,
  'text-to-speech':        0.00,
};

export const getPrice = (toolType) => TOOL_PRICES[toolType] ?? 0.00;
