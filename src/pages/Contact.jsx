import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';
import PageSEO from '@/components/seo/PageSEO';

const Contact = () => {
  const { t } = useTranslation('common');
  return (
    <div className={`py-16 ${CONTAINER.blog}`}>
      <PageSEO
        title={t('seo.contact.title')}
        description={t('seo.contact.desc')}
        path="/contact"
      />
      <Typography variant="h2" weight="bold" className="block mb-4">
        {t('footer.contact')}
      </Typography>
      <p className="text-muted-foreground">{t('comingSoon')}</p>
    </div>
  );
};

export default Contact;
