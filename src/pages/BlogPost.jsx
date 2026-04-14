import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const API = 'http://localhost:5200';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/blog/posts/${slug}`)
      .then(({ data }) => setPost(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="py-12 text-center text-muted-foreground">Загрузка...</div>;
  if (notFound) return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground mb-4">Статья не найдена</p>
      <Link to="/blog" className="text-primary hover:underline text-sm">← Вернуться в блог</Link>
    </div>
  );

  const seoTitle = post.seo_title || post.title;
  const seoDesc = post.seo_description || post.excerpt || '';

  return (
    <>
      <Helmet>
        <title>{seoTitle} — FillTech</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="article" />
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
      </Helmet>

      <div className="py-12 max-w-3xl mx-auto px-4">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Блог
        </Link>

        <article>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {new Date(post.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div
            className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {post.content}
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPost;
