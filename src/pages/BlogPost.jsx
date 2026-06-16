import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/contexts/LangContext';
import LangLink from '@/components/routing/LangLink';
import PageSEO from '@/components/seo/PageSEO';
import { ArrowLeft, Pencil, Heart } from 'lucide-react';
import { CONTAINER } from '@/config/sizes';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import Comments from '@/components/blog/Comments';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { API_URL as API } from '@/config/api';

const BlogPost = () => {
  const { t }    = useTranslation('blog');
  const { t: tc } = useTranslation('common');
  const lang     = useLang();
  const { slug } = useParams();
  const { openAuthModal } = useAuthModal();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/blog/posts/${slug}`)
      .then(({ data }) => setPost(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post?.id) return;
    const userUid = localStorage.getItem('userUID');
    axios.get(`${API}/api/blog/posts/${post.id}/likes`, {
      headers: userUid ? { 'x-user-uid': userUid } : {},
    })
      .then(({ data }) => { setLikeCount(data.count); setIsLiked(data.liked); })
      .catch(() => {});
  }, [post?.id]);

  const handleLike = async () => {
    const userUid = localStorage.getItem('userUID');
    if (!userUid) { openAuthModal('login'); return; }
    if (likeLoading) return;

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount(c => c + (nextLiked ? 1 : -1));
    setLikeLoading(true);

    try {
      const { data } = await axios.post(`${API}/api/blog/posts/${post.id}/like`, {}, {
        headers: { 'x-user-uid': userUid },
      });
      setIsLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount(c => c + (nextLiked ? -1 : 1));
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) return (
    <div className="py-12 text-center">
      <Typography variant="body2" color="muted">{tc('loading')}</Typography>
    </div>
  );

  if (notFound) return (
    <div className="py-12 text-center flex flex-col items-center gap-4">
      <Typography variant="body1" color="muted">{t('noPosts')}</Typography>
      <LangLink to="/blog" className="text-primary hover:underline text-sm">
        ← {t('backToBlog')}
      </LangLink>
    </div>
  );

  const seoTitle = post.seo_title || post.title;
  const seoDesc = post.seo_description || post.excerpt || '';

  return (
    <>
      <Helmet>
        <title>{seoTitle} - Visaulio</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="article" />
        {post.cover_url && <meta property="og:image" content={post.cover_url} />}
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
      </Helmet>

      {/* Back + edit */}
      <div className={`pt-12 pb-6 ${CONTAINER.post}`}>
        <div className="flex items-center justify-between">
          <LangLink
            to="/blog"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            <Typography variant="body2" color="muted">{t('backToBlog')}</Typography>
          </LangLink>

          {localStorage.getItem('userRole') === 'admin' && (
            <LangLink to={`/admin/blog/${post.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil size={14} className="mr-1.5" /> {t('admin.edit')}
              </Button>
            </LangLink>
          )}
        </div>
      </div>

      {post.cover_url && (
        <div className="w-full aspect-[21/9] overflow-hidden">
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`pb-16 ${CONTAINER.post}`}>
        <article className="pt-8">
          <Typography variant="h2" weight="bold" className="block mb-3">
            {post.title}
          </Typography>

          <Typography variant="body2" color="muted" className="block mb-10">
            {new Date(post.published_at).toLocaleDateString(lang, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Typography>

          <div
            className="rich-editor-output leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 pt-6 border-t border-border flex items-center">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-foreground/40 transition-colors disabled:opacity-60"
              aria-label={isLiked ? t('likes.liked') : t('likes.like')}
            >
              <Heart
                size={18}
                className={isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
              />
              <Typography variant="body2" className="block">
                {t('likes.count', { count: likeCount })}
              </Typography>
            </button>
          </div>

          <Comments postId={post.id} />
        </article>
      </div>
    </>
  );
};

export default BlogPost;
