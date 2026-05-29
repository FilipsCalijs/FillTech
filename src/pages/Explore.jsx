import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { CONTAINER } from '@/config/sizes';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/contexts/LangContext';
import PageSEO from '@/components/seo/PageSEO';

const API = 'http://localhost:5200';

const Explore = () => {
  const { t, i18n } = useTranslation('common');
  const { t: te } = useTranslation('effects');
  const lang = useLang();
  const effectName = (slug) => te(`${slug}.name`, { defaultValue: slug });
  const effectDesc = (slug) => te(`${slug}.desc`, { defaultValue: '' });
  const [effects, setEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/effects`)
      .then(({ data }) => setEffects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO title={t('seo.explore.title')} description={t('seo.explore.desc')} path="/explore" />
      <Typography variant="h2" weight="bold" className="block mb-2">{t('nav.explore')}</Typography>
      <Typography variant="body1" color="muted" className="block mb-10">{t('exploreSubtitle')}</Typography>

      {loading ? (
        <Typography variant="body2" color="muted" className="block">{t("loading")}</Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {effects.map((effect) => (
            <div
              key={effect.id}
              onClick={() => navigate(`/${lang}/tools/${effect.slug}`)}
              className="group cursor-pointer border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-all duration-200"
            >
              {/* Cover */}
              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={effect.cover_url || 'https://placehold.co/300x300'}
                  alt={effect.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col gap-3">
                <Typography variant="h4" weight="semibold">{effectName(effect.slug)}</Typography>
                <Typography variant="body2" color="muted" className="block line-clamp-2">{effectDesc(effect.slug) || effect.short_desc}</Typography>
                <Button size="sm" className="w-full mt-1">
                  {te('tryIt')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
