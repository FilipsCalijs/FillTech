import { useState } from 'react';
import { Mic, Zap, Clock, BookOpen } from 'lucide-react';
import { Typography } from '@/components/ui/Typography';
import { Card, CardContent } from '@/components/ui/Card';
import { CONTAINER } from '@/config/sizes';
import { useTranslation } from 'react-i18next';
import PageSEO from '@/components/seo/PageSEO';
import AudioPlayer from '@/components/ui/AudioPlayer';
import StepsSection from '@/lib/StepsSection';
import FeaturesGrid from '@/lib/FeaturesGrid';
import FAQSection from '@/lib/FAQSection';
import TextSection from '@/lib/TextSection';
import OtherProducts from '@/lib/OtherProducts';
import RelevantBlogs from '@/components/ui/RelevantBlogs';
import { API_URL as API } from '@/config/api';
import { useAuthModal } from '@/contexts/AuthModalContext';

const MAX_CHARS = 500;

const PRESET_PROMPTS = {
  calm:      'Calm and professional female voice, clear articulation, neutral accent',
  energetic: 'Energetic and enthusiastic male voice, fast-paced, warm and friendly',
  deep:      'Deep authoritative male voice, slow pace, confident and serious tone',
  soft:      'Soft and gentle female voice, slow pace, soothing and relaxing tone',
};

const TextToSpeech = () => {
  const { t } = useTranslation('tools');
  const { requireAuth } = useAuthModal();

  const [text,    setText]    = useState('');
  const [prompt,  setPrompt]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) { setError(t('textToSpeech.error.textRequired')); return; }
    if (text.length > MAX_CHARS) { setError(t('textToSpeech.error.textTooLong')); return; }
    if (!requireAuth()) return;

    setLoading(true);
    setError(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const res = await fetch(`${API}/api/tools/text-to-speech`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-uid': userUid },
        body:    JSON.stringify({ text: text.trim(), prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('textToSpeech.error.generic'));
      setResult({ audioUrl: data.audioUrl, generationId: data.generationId });
    } catch (err) {
      setError(err.message || t('textToSpeech.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.audioUrl;
    a.download = 'speech.mp3';
    a.target = '_blank';
    a.click();
  };

  const steps = [
    { title: t('textToSpeech.steps.0.title'), description: t('textToSpeech.steps.0.desc') },
    { title: t('textToSpeech.steps.1.title'), description: t('textToSpeech.steps.1.desc') },
    { title: t('textToSpeech.steps.2.title'), description: t('textToSpeech.steps.2.desc') },
  ];

  const stepImages = [
    'https://placehold.co/600x400/1a1a2e/ffffff?text=Step+1',
    'https://placehold.co/600x400/1a1a2e/ffffff?text=Step+2',
    'https://placehold.co/600x400/1a1a2e/ffffff?text=Step+3',
  ];

  const features = [
    { icon: <Mic size={28} />,    title: t('textToSpeech.features.0.title'), desc: t('textToSpeech.features.0.desc') },
    { icon: <BookOpen size={28} />, title: t('textToSpeech.features.1.title'), desc: t('textToSpeech.features.1.desc') },
    { icon: <Zap size={28} />,    title: t('textToSpeech.features.2.title'), desc: t('textToSpeech.features.2.desc') },
    { icon: <Clock size={28} />,  title: t('textToSpeech.features.3.title'), desc: t('textToSpeech.features.3.desc') },
  ];

  const faqs = [
    { q: t('textToSpeech.faq.0.q'), a: t('textToSpeech.faq.0.a') },
    { q: t('textToSpeech.faq.1.q'), a: t('textToSpeech.faq.1.a') },
    { q: t('textToSpeech.faq.2.q'), a: t('textToSpeech.faq.2.a') },
    { q: t('textToSpeech.faq.3.q'), a: t('textToSpeech.faq.3.a') },
  ];

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO
        title={t('textToSpeech.seo.title')}
        description={t('textToSpeech.seo.description')}
        path="/tools/text-to-speech"
      />

      <Typography variant="h2" weight="bold" className="block mb-2">{t('textToSpeech.title')}</Typography>
      <Typography variant="lead" color="muted" className="block mb-10">{t('textToSpeech.subtitle')}</Typography>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 flex flex-col gap-5">

            {/* Text input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Typography variant="label" weight="semibold">{t('textToSpeech.textLabel')}</Typography>
                <span className={`text-xs font-mono ${text.length > MAX_CHARS ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
              <textarea
                rows={5}
                maxLength={MAX_CHARS + 50}
                value={text}
                onChange={(e) => { setText(e.target.value); setError(null); }}
                placeholder={t('textToSpeech.textPlaceholder')}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
              />
            </div>

            {/* Voice presets */}
            <div className="flex flex-col gap-2">
              <Typography variant="label" weight="semibold">{t('textToSpeech.presetsLabel')}</Typography>
              <div className="flex flex-wrap gap-2">
                {(['calm', 'energetic', 'deep', 'soft']).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPrompt(PRESET_PROMPTS[key])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${prompt === PRESET_PROMPTS[key]
                        ? 'border-[#F5A623] bg-[#F5A623]/10 text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'}`}
                  >
                    {t(`textToSpeech.preset.${key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice description prompt */}
            <div className="flex flex-col gap-1.5">
              <Typography variant="label" weight="semibold">{t('textToSpeech.voiceLabel')}</Typography>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('textToSpeech.promptPlaceholder')}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-bold text-sm tracking-[0.08em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {t('textToSpeech.loading')}
                </>
              ) : t('textToSpeech.submit')}
            </button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <div className="mt-6 flex flex-col gap-4">
            <AudioPlayer src={result.audioUrl} />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
              >
                {t('textToSpeech.result.download')}
              </button>
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
              >
                {t('textToSpeech.result.again')}
              </button>
              <span className="flex items-center text-xs text-muted-foreground">
                {t('textToSpeech.result.saved')}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-20 flex flex-col gap-16">
        <StepsSection
          title={t('textToSpeech.steps.title')}
          steps={steps}
          images={stepImages}
        />
        <FeaturesGrid
          title={t('textToSpeech.features.title')}
          features={features}
        />
        <FAQSection
          title={t('textToSpeech.faq.title')}
          faqs={faqs}
        />
        <TextSection
          title={t('textToSpeech.seoText.title')}
          text={t('textToSpeech.seoText.text')}
        />
        <RelevantBlogs currentSlug="text-to-speech" />
        <OtherProducts currentSlug="text-to-speech" />
      </div>
    </div>
  );
};

export default TextToSpeech;
