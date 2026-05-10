import { Scissors, Zap, Shield, ImageDown } from 'lucide-react';
import { useToolProcessor } from '@/hooks/useToolProcessor';

import ToolHero from '@/lib/ToolHero';
import Result from '@/lib/Result';
import StepsSection from '@/lib/StepsSection';
import BeforeAfterSection from '@/lib/BeforeAfterSection';
import FeaturesGrid from '@/lib/FeaturesGrid';
import CardLeftImage from '@/lib/CardLeftImage';
import CardRightImage from '@/lib/CardRightImage';
import FAQSection from '@/lib/FAQSection';
import OtherProducts from '@/lib/OtherProducts';

const STEPS = [
  {
    title: '1. Upload your image',
    description: 'Drag & drop or click to upload any photo — JPG, PNG, or WEBP. No account required to try.',
  },
  {
    title: '2. AI removes the background',
    description: 'Our AI model (RMBG-2.0) instantly detects the subject and removes the background with pixel-level accuracy.',
  },
  {
    title: '3. Download as PNG',
    description: 'Get your image with a transparent background in full HD quality, ready for any use.',
  },
];

const STEP_IMAGES = [
  '/bg-remover/step1.webp',
  '/bg-remover/step2.webp',
  '/bg-remover/step3.webp',
];

const FEATURES = [
  {
    icon: <Zap size={28} />,
    title: 'Lightning Fast',
    desc: 'Background removed in under 3 seconds, no matter the image complexity.',
  },
  {
    icon: <Scissors size={28} />,
    title: 'Pixel Accurate',
    desc: 'AI handles fine details like hair, fur, and transparent edges perfectly.',
  },
  {
    icon: <ImageDown size={28} />,
    title: 'HD Quality',
    desc: 'Download in full resolution with a transparent PNG — no watermarks.',
  },
  {
    icon: <Shield size={28} />,
    title: 'Private & Secure',
    desc: 'Your images are processed securely and never stored permanently.',
  },
];

const FAQS = [
  {
    q: 'What image formats are supported?',
    a: 'We support JPG, PNG, and WEBP images up to 50 MB. For best results use images with a clear subject.',
  },
  {
    q: 'Is the background removal free?',
    a: 'Yes — you get a set number of free generations per month. Upgrade to a paid plan for unlimited use.',
  },
  {
    q: 'How accurate is the AI?',
    a: 'We use RMBG-2.0 by BRIA AI, one of the most accurate open background removal models available today. It handles hair, fur, and complex edges.',
  },
  {
    q: 'Can I use the result commercially?',
    a: 'Yes. Once processed, the resulting image is yours to use however you like, including commercial projects.',
  },
  {
    q: 'What happens to my uploaded images?',
    a: 'Uploaded images are processed and temporarily stored for you to download the result. They are deleted automatically after 14 days.',
  },
];

const BgRemover = () => {
  const { file, previewUrl, loading, resultUrl, error, handleFileDrop, handleSubmit } =
    useToolProcessor('bg-remove');

  return (
    <div className="py-8 md:py-12 flex flex-col items-center gap-16">

      <ToolHero
        title="Remove Background with AI"
        subtitle="Upload any photo and get a clean transparent PNG in seconds — powered by RMBG-2.0."
        buttonLabel="Remove Background"
        file={file}
        loading={loading}
        error={error}
        onFileDrop={handleFileDrop}
        onSubmit={handleSubmit}
        rightImage="/bg-remover/hero.webp"
      />

      <Result
        isVisible={!!resultUrl}
        originalImage={previewUrl}
        removedImage={resultUrl}
      />

      <StepsSection steps={STEPS} images={STEP_IMAGES} />

      <BeforeAfterSection
        title="See the Difference"
        desc="Drag the slider to compare the original photo with the background removed version. The AI preserves every detail of the subject."
        beforeImage="/bg-remover/before.webp"
        afterImage="/bg-remover/after.webp"
      />

      <FeaturesGrid title="Why Use Our BG Remover?" features={FEATURES} />

      <div className="flex flex-col items-center gap-12 w-full px-4">
        <div className="w-full max-w-[1280px] flex flex-col gap-12">
          <CardLeftImage
            title="Perfect for Product Photos"
            text="Remove backgrounds from product images instantly. Get clean, professional-looking shots ready for your online store or catalogue — no Photoshop needed."
            imageUrl="/bg-remover/usecase-product.webp"
            alt="Product photo background removal"
          />
          <CardRightImage
            title="Portrait & Profile Photos"
            text="Isolate people from any background. Great for LinkedIn headshots, team pages, ID photos, or creative composites. Hair and fine edges are handled with precision."
            imageUrl="/bg-remover/usecase-portrait.webp"
            alt="Portrait background removal"
          />
          <CardLeftImage
            title="Design & Creative Work"
            text="Speed up your workflow by cutting out subjects in one click. Drop them onto any new background, layer them in your design, or export as transparent PNGs."
            imageUrl="/bg-remover/usecase-design.webp"
            alt="Design workflow background removal"
          />
        </div>
      </div>

      <FAQSection title="Frequently Asked Questions" faqs={FAQS} />

      <OtherProducts />

    </div>
  );
};

export default BgRemover;
