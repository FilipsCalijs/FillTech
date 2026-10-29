import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { CONTAINER, RADIUS, GRID } from '@/config/sizes';
import { Typography } from '@/components/ui/Typography';
import LangLink from '@/components/routing/LangLink';
import { useLang } from '@/contexts/LangContext';
import PageSEO from '@/components/seo/PageSEO';
import { API_URL as API } from '@/config/api';
import { PageLoader } from '@/components/ui/Spinner';

const Blog = () => {
  const { t }   = useTranslation('blog');
  const lang    = useLang();
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/blog/posts?lang=${lang}`)
      .then(({ data }) => setPosts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <>
      <PageSEO title={t('title')} description={t('subtitle')} path="/blog" />

      <div className={`py-12 ${CONTAINER.blog}`}>
        <Typography variant="h2" weight="bold" className="block mb-8">{t('title')}</Typography>

        {loading ? (
          <PageLoader />
        ) : posts.length === 0 ? (
          <Typography variant="body2" color="muted" className="block">{t('noPosts')}</Typography>
        ) : (
          <div className={GRID.blog}>
            {posts.filter(p => p.slug).map((post) => (
              <LangLink key={post.id} to={`/blog/${post.slug}`} className="group">
                <article className="flex flex-col overflow-hidden h-full">
                  <div className={`aspect-video overflow-hidden bg-muted/20 ${RADIUS.imageTop}`}>
                    {post.cover_url ? (
                      <img src={post.cover_url} alt={post.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${RADIUS.imageTop}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <Typography variant="h2" weight="bold"
                      className="block leading-snug group-hover:text-primary transition-colors line-clamp-3">
                      {post.title}
                    </Typography>
                    {post.excerpt && (
                      <Typography variant="body2" color="muted" className="block flex-1 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </Typography>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <Typography variant="body2" color="primary" weight="medium" className="block">
                        {t('readMore')} →
                      </Typography>
                      <Typography variant="caption" color="muted" className="block">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })
                          : ''}
                      </Typography>
                    </div>
                  </div>
                </article>
              </LangLink>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
