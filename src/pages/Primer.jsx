import { Scissors, Zap, Shield, ImageDown } from 'lucide-react';
import { Typography } from '@/components/ui/Typography';

import ToolHero from '@/lib/ToolHero';
import StepsSection from '@/lib/StepsSection';
import BeforeAfterSection from '@/lib/BeforeAfterSection';
import FeaturesGrid from '@/lib/FeaturesGrid';
import CardLeftImage from '@/lib/CardLeftImage';
import CardRightImage from '@/lib/CardRightImage';
import FAQSection from '@/lib/FAQSection';
import OtherProducts from '@/lib/OtherProducts';
import Result from '@/lib/Result';

const DEMO_STEPS = [
  { title: '1. Upload your image', description: 'Drag & drop or click to upload any photo.' },
  { title: '2. AI processes it', description: 'Our model handles the job in seconds.' },
  { title: '3. Download result', description: 'Get your result in full HD quality.' },
];

const DEMO_FEATURES = [
  { icon: <Zap size={28} />, title: 'Fast', desc: 'Processed in under 3 seconds.' },
  { icon: <Scissors size={28} />, title: 'Accurate', desc: 'Pixel-perfect results every time.' },
  { icon: <ImageDown size={28} />, title: 'HD Quality', desc: 'No quality loss, no watermarks.' },
  { icon: <Shield size={28} />, title: 'Secure', desc: 'Images never stored permanently.' },
];

const DEMO_FAQS = [
  { q: 'What formats are supported?', a: 'JPG, PNG, and WEBP up to 50 MB.' },
  { q: 'Is it free?', a: 'Yes, with a monthly free tier. Upgrade for unlimited use.' },
  { q: 'Is my data safe?', a: 'Yes. Files are auto-deleted after 14 days.' },
];

const PrimerBlock = ({ name, children }) => (
  <div className="flex flex-col items-center w-full gap-3">
    <div className="w-full">{children}</div>
    <div className="flex items-center gap-3 w-full max-w-[1280px] px-4">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-mono text-muted-foreground px-3 py-1 rounded-full border border-border bg-muted/30 shrink-0">
        {name}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  </div>
);

const Primer = () => {
  return (
    <div className="py-12 flex flex-col items-center gap-20">

      {/* Header */}
      <div className="w-full max-w-[1280px] px-4 flex flex-col gap-2">
        <Typography variant="h1" weight="bold" className="block gradient-text">
          Primer — Page Modules
        </Typography>
        <Typography variant="body1" color="muted" className="block">
          All reusable page sections. Pick what you need when building a new tool page.
        </Typography>
      </div>

      {/* ─── Modules ─────────────────────────────────────────── */}

      <PrimerBlock name="ToolHero">
        <ToolHero
          title="Your Tool Title Here"
          subtitle="Short description of what the tool does and why the user should try it."
          buttonLabel="Generate"
          file={null}
          loading={false}
          error={null}
          onFileDrop={() => {}}
          onSubmit={() => {}}
          rightImage={null}
        />
      </PrimerBlock>

      <PrimerBlock name="Result">
        <Result
          isVisible={true}
          originalImage="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80"
          removedImage="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80"
        />
      </PrimerBlock>

      <PrimerBlock name="StepsSection">
        <StepsSection
          steps={DEMO_STEPS}
          images={[
            'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80',
            'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80',
            'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80',
          ]}
        />
      </PrimerBlock>

      <PrimerBlock name="BeforeAfterSection">
        <BeforeAfterSection
          title="See the Difference"
          desc="Drag the slider to compare before and after. Works great for any transformation tool."
          beforeImage="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80"
          afterImage="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80"
        />
      </PrimerBlock>

      <PrimerBlock name="FeaturesGrid">
        <FeaturesGrid title="Why Choose Us" features={DEMO_FEATURES} />
      </PrimerBlock>

      <PrimerBlock name="CardLeftImage">
        <CardLeftImage
          title="Feature Highlight (image left)"
          text="Use this block to highlight a key use case or benefit. Image sits on the left, text on the right."
          imageUrl="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80"
          alt="Feature"
        />
      </PrimerBlock>

      <PrimerBlock name="CardRightImage">
        <CardRightImage
          title="Feature Highlight (image right)"
          text="Same block with image flipped to the right. Alternate these to create visual rhythm on the page."
          imageUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80"
          alt="Feature"
        />
      </PrimerBlock>

      <PrimerBlock name="FAQSection">
        <FAQSection title="Frequently Asked Questions" faqs={DEMO_FAQS} />
      </PrimerBlock>

      <PrimerBlock name="OtherProducts">
        <OtherProducts />
      </PrimerBlock>

    </div>
  );
};

export default Primer;
