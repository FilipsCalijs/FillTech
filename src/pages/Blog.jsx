import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const API = 'http://localhost:5200';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/blog/posts`)
      .then(({ data }) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Блог — FillTech</title>
        <meta name="description" content="Статьи и новости от команды FillTech об AI инструментах для работы с медиа." />
        <meta property="og:title" content="Блог — FillTech" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="py-12 max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Блог</h1>

        {loading ? (
          <p className="text-muted-foreground">Загрузка...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">Статей пока нет</p>
        ) : (
          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-border pb-8">
                <Link to={`/blog/${post.slug}`} className="group">
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{new Date(post.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <Link to={`/blog/${post.slug}`} className="text-primary hover:underline">Читать →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
