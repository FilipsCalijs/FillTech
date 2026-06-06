import { useState, useCallback, useRef } from 'react';
import { Zap, ShieldCheck, ScanSearch, Layers } from 'lucide-react';
import PageSEO from '@/components/seo/PageSEO';
import LangLink from '@/components/routing/LangLink';
import Result from '@/lib/Result';
import StepsSection from '@/lib/StepsSection';
import BeforeAfterSection from '@/lib/BeforeAfterSection';
import BeforeAfterSlider from '@/lib/beforeAfterSlider';
import FeaturesGrid from '@/lib/FeaturesGrid';
import CardLeftImage from '@/lib/CardLeftImage';
import CardRightImage from '@/lib/CardRightImage';
import FAQSection from '@/lib/FAQSection';
import TextSection from '@/lib/TextSection';
import OtherProducts from '@/lib/OtherProducts';

const API = 'http://localhost:5200';
const MAX_MB = 22;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const STEPS = [
  {
    title: '1. Upload your watermarked image',
    description: 'Drag and drop your photo or click to browse. We support JPG, PNG, WEBP, BMP, and HEIC formats up to 50 MB - no account or sign-up needed to get started.',
  },
  {
    title: '2. AI detects and erases the watermark',
    description: "Our AI model scans the image, identifies the watermark - whether it\'s a text overlay, a semi-transparent logo, a timestamp, or a repeated pattern - and removes it while reconstructing the background underneath.",
  },
  {
    title: '3. Download your clean image',
    description: 'Once processing is done, preview your result and download the watermark-free image in full resolution. Your original image quality is preserved - no blurring, no artifacts.',
  },
];

const FEATURES = [
  {
    icon: <ScanSearch size={28} />,
    title: 'Smart Auto-Detection',
    desc: "The AI finds the watermark on its own - you don\'t need to draw a selection box or highlight anything manually. It recognizes text, logos, semi-transparent marks, and full-screen repeated patterns automatically.",
  },
  {
    icon: <Zap size={28} />,
    title: 'Results in Under 10 Seconds',
    desc: "Most images are processed in under 10 seconds. Upload, wait a moment, download - there\'s no queue, no wait time, and no need to install any software on your device.",
  },
  {
    icon: <Layers size={28} />,
    title: 'Handles Complex Watermarks',
    desc: 'Simple text overlays are easy. But this tool also handles low-opacity marks, multi-layered watermarks, logos placed over faces or detailed backgrounds, and tiled patterns that repeat across the whole image.',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Your Files Stay Private',
    desc: "Uploaded images are processed securely and never stored permanently on our servers. We don\'t use your photos for training or share them with third parties. What you upload stays yours.",
  },
];

const FAQS = [
  {
    q: 'Can I remove a watermark from a photo online for free?',
    a: 'Yes. You can upload an image and remove the watermark directly on this page at no cost. Free usage comes with a monthly processing limit. If you need to process a large volume of images, premium and batch plans are available.',
  },
  {
    q: 'Do I need to manually select or mark the watermark?',
    a: "No. The AI automatically detects where the watermark is and removes it without any input from you. You just upload the image and download the clean result. If the automatic result isn\'t perfect on a particularly tricky image, you can use the manual brush mode to fine-tune specific areas.",
  },
  {
    q: 'Which image formats are supported?',
    a: 'The tool supports JPG, JPEG, PNG, WEBP, BMP, and HEIC. If you have an image in a different format, convert it to PNG or JPG first and then upload it here.',
  },
  {
    q: 'Will removing the watermark reduce my image quality?',
    a: 'No. The AI reconstructs the area underneath the watermark to match the surrounding texture and content. Your image is returned at its original resolution without blur, compression artifacts, or visible patching.',
  },
  {
    q: 'Can the AI remove watermarks that cover faces or detailed backgrounds?',
    a: "Yes, this is one of the harder problems and one we\'ve specifically trained for. Watermarks placed over faces, hair, fine texture, or complex backgrounds are removed using the surrounding context to fill in the detail realistically.",
  },
  {
    q: 'Does it work on old scanned photos or images with printed marks?',
    a: 'Yes. Unlike tools built only for clean digital images, this one handles scanned photos, graduation pictures with studio watermarks, and images where the mark is baked into the file from an older camera or printing process.',
  },
  {
    q: 'Can I remove watermarks from a batch of images at once?',
    a: 'Batch processing is available on premium plans, letting you upload and process multiple images in a single session. Free usage processes one image at a time.',
  },
  {
    q: 'Is it legal to remove a watermark from an image?',
    a: "That depends on how you use the image afterward. Removing a watermark from an image you own or have licensed is generally fine. Using the cleaned image commercially without the rights to the original content is not. When in doubt, check the license of the original image before publishing or distributing it.",
  },
  {
    q: 'Are my uploaded images kept private?',
    a: 'Yes. Images you upload are processed on secure servers and are not stored permanently, shared with third parties, or used for model training. Your files are deleted after processing.',
  },
  {
    q: 'Can this tool remove full-screen or repeated tiled watermarks?',
    a: 'Yes. The AI is trained to handle watermarks that repeat across the entire image as a pattern, not just single-position marks. It reconstructs the full image content beneath the repeating overlay.',
  },
];

const SEO_TEXT = `Watermarks protect the work of photographers, designers, and content creators. But there are many legitimate situations where you need a clean version: you own the image, you have licensed a stock photo and need to strip the preview overlay, or you are cleaning up old personal photos with timestamps burned in from an older camera.

Doing this manually in Photoshop takes time, skill, and patience - especially when the watermark sits over a complex background. This AI watermark remover does the same job in seconds, without any editing knowledge required. Upload the image, wait a moment, and download the clean result.

The tool uses an AI inpainting model that does not just erase the mark - it actively reconstructs what should be underneath it. When the watermark covers sky, the AI fills in a matching gradient. When it covers a face, it rebuilds the skin texture using the surrounding pixels. The result looks natural because the model predicts what the image should look like, not simply blends or smears pixels over the mark.

This approach matters most for the harder cases: low-opacity watermarks blended into the image, repeated tile patterns across the full frame, author signatures in unusual fonts, and marks placed directly over the main subject. These are the situations where simpler tools fail and proper inpainting makes the difference.

The tool works across all common formats - JPG, PNG, WEBP, BMP, HEIC - and returns the processed image at full original resolution. There is no quality loss from extra compression, no sign-up required for basic use, and no software to install. It works equally well on desktop, tablet, and mobile.

Photographers cleaning old archives, real estate professionals needing clean listing photos, e-commerce sellers working with product images, and designers cleaning up visual assets for client projects - this is the quickest path from a watermarked image to a clean one.`;

const WatermarkRemover = () => {
  const [file,          setFile]          = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [removedImage,  setRemovedImage]  = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [isDragging,    setIsDragging]    = useState(false);
  const fileInputRef = useRef(null);

  const handleFileDrop = useCallback((f) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError(`Image too large: ${(f.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setOriginalImage(URL.createObjectURL(f));
    setRemovedImage(null);
    setResultVisible(false);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultVisible(false);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form = new FormData();
      form.append('image', file);

      const res = await fetch(`${API}/api/tools/watermark-remove`, {
        method: 'POST',
        headers: { 'x-user-uid': userUid },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setRemovedImage(data.imageUrl);
      setResultVisible(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 flex flex-col items-center gap-20">
      <PageSEO
        title="Free AI Watermark Remover - Remove Watermarks Online"
        description="Remove watermarks from photos online for free. Our AI watermark remover erases text, logos, timestamps, and copyright marks in seconds - no Photoshop, no sign-up needed."
        path="/tools/watermark-remover"
      />

      {/* ── Hero: tabs + title + subtitle + upload ── */}
      <div className="w-full max-w-[1440px] px-4 flex flex-col items-center gap-8">

        {/* Tab switcher */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-muted/20">
          <span className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-bold cursor-default">
            Image
          </span>
          <LangLink
            to="/tools/watermark-remover-video"
            className="px-5 py-2 rounded-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Video
          </LangLink>
        </div>

        {/* Title */}
        <h1 className="text-[52px] leading-tight font-bold text-center">
          <span className="bg-gradient-to-r from-[#F5A623] to-[#FBCF33] bg-clip-text text-transparent">AI</span>
          {' '}Online Watermark Remover
        </h1>

        {/* Subtitle */}
        <p className="text-[22px] text-muted-foreground text-center max-w-3xl leading-relaxed">
          Drop your image and let the AI erase watermarks, logos, and text overlays in seconds - no manual selection, no editing skills required.
        </p>

        {/* Upload zone */}
        <div className="w-[80%] mx-auto">
          <div
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-5 cursor-pointer transition-all min-h-[280px] ${
              isDragging ? 'border-[#F5A623] bg-gradient-to-b from-[#F5A623]/10 to-transparent' : 'border-border bg-card'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileDrop(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileDrop(e.target.files?.[0])}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-foreground font-semibold text-lg">{file.name}</span>
                <span className="text-muted-foreground text-sm">Click to change file</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-bold text-xl shadow-lg ring-2 ring-[#F5A623] ring-offset-2 ring-offset-card hover:opacity-90 transition-opacity pointer-events-none"
                >
                  <span className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white font-bold text-2xl leading-none">+</span>
                  Upload
                </button>
                <p className="text-muted-foreground text-base text-center">
                  Drop an image here &nbsp;&middot;&nbsp; JPG, PNG, WEBP, HEIC &nbsp;&middot;&nbsp; max {MAX_MB} MB
                </p>
              </>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
            disabled={loading || !file}
            className="mt-3 w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:cursor-not-allowed"
          >
            {loading ? 'Removing watermark...' : 'Remove Watermark'}
          </button>
        </div>

        <Result
          isVisible={resultVisible}
          originalImage={originalImage}
          removedImage={removedImage}
        />
      </div>

      {/* ── Keywords + description + slider ── */}
      <div className="w-full max-w-[1440px] px-4 flex flex-col items-center gap-10">

        {/* Keyword badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: 'Free', gold: true },
            { label: 'AI-Powered' },
            { label: 'No Sign-up' },
            { label: 'HD Quality' },
            { label: 'Instant Results' },
            { label: 'Secure & Private' },
          ].map(({ label, gold }) => (
            <span
              key={label}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                gold
                  ? 'border-[#F5A623] bg-gradient-to-r from-[#F5A623] to-[#FBCF33] bg-clip-text text-transparent'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="w-full flex flex-col gap-3 text-center">
          <h2 className="text-[42px] font-bold leading-tight">
            <span className="bg-gradient-to-r from-[#F5A623] to-[#FBCF33] bg-clip-text text-transparent">Free</span> AI Watermark Removal Tool
          </h2>
          <p className="text-[20px] text-muted-foreground leading-relaxed">
            The easiest tool to remove watermarks from photos without any cost, ensuring the best quality images.
          </p>
        </div>

        {/* Full-width before/after slider */}
        <div className="w-[70%] mx-auto">
          <BeforeAfterSlider
            beforeImage="/watermark_remover/before.webp"
            afterImage="/watermark_remover/after.webp"
            width="100%"
            aspectRatio="16/9"
            autoAnimate={true}
          />
        </div>
      </div>

      <StepsSection
        steps={STEPS}
        images={[
          '/watermark_remover/before.webp',
          '/watermark_remover/Remove-watermark-from-photo.webp',
          '/watermark_remover/after.webp',
        ]}
        autoInterval={3000}
      />

      <BeforeAfterSection
        title="See What the AI Actually Does"
        desc="Drag the slider to compare. The AI reconstructs the background under the watermark - the result is seamless, not just painted over."
        beforeImage="/watermark_remover/before.webp"
        afterImage="/watermark_remover/after.webp"
      />

      <FeaturesGrid
        title="Why This Watermark Remover Works Better"
        features={FEATURES}
      />

      <CardLeftImage
        noCard
        title="Remove Any Type of Watermark - Text, Logo, or Timestamp"
        text="Not all watermarks are created equal. Some are bold text overlays in a corner. Others are faint semi-transparent logos spread across the entire image. Some are date stamps burned in from old cameras, author signatures, or copyright notices. This tool is trained to handle all of them. It works on stock photo watermarks, social media brand marks, photographer signatures, and even the proof overlays that preview services place across the center of an image. The AI adapts to whatever it finds rather than applying a single fixed approach - which is why the results hold up even on complex photos."
        imageUrl="/watermark_remover/remove-watermark-from-stock-sites-1024x613.jpg"
        alt="Examples of different watermark types removed by AI"
      />

      <CardRightImage
        noCard
        title="Works on Old Scans, Graduation Photos, and Screenshots Too"
        text="Most watermark removers are built for clean, modern digital photos. This one also handles edge cases that other tools miss. Scanned images with watermarks printed directly on them, old graduation or school photos with studio marks, screenshots with overlay banners, and images with watermarks placed directly over faces or fine details - the AI is trained on these difficult scenarios specifically. If you have a photo that matters to you and it has a mark you can't get rid of, this is the tool to try first."
        imageUrl="/watermark_remover/before-and-after-effect-of-removing-watermark-from-white-flower-image-in-AI-Ease.webp"
        alt="AI removing watermarks from scanned photos and graduation pictures"
      />

      <FAQSection
        title="Frequently Asked Questions"
        faqs={FAQS}
      />

      <TextSection
        title="The Fastest Way to Remove Watermarks from Photos Online"
        text={SEO_TEXT}
      />

      <OtherProducts currentSlug="watermark-remover" />
    </div>
  );
};

export default WatermarkRemover;
