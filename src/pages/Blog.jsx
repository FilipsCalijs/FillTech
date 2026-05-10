import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { CONTAINER, RADIUS, GRID } from '@/config/sizes';
import { Typography } from '@/components/ui/Typography';

const API = 'http://localhost:5200';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/blog/posts`)
      .then(({ data }) => setPosts(data))
      .catch(console.error)
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

      <div className={`py-12 ${CONTAINER.blog}`}>
        <Typography variant="h2" weight="bold" className="block mb-8">Блог</Typography>

        {loading ? (
          <Typography variant="body2" color="muted" className="block">Загрузка...</Typography>
        ) : posts.length === 0 ? (
          <Typography variant="body2" color="muted" className="block">Статей пока нет</Typography>
        ) : (
          <div className={GRID.blog}>
            {posts.filter(p => p.slug).map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <article className="flex flex-col overflow-hidden h-full">

                  {/* Обложка */}
                  <div className={`aspect-video overflow-hidden bg-muted/20 ${RADIUS.imageTop}`}>
                    {post.cover_url ? (
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${RADIUS.imageTop}`}
                      />
                    ) : (
                      <Typography variant="body2" color="muted" className="w-full h-full flex items-center justify-center">
                        Нет обложки
                      </Typography>
                    )}
                  </div>

                  {/* Контент карточки */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <Typography
                      variant="h2"
                      weight="bold"
                      className="block leading-snug group-hover:text-primary transition-colors line-clamp-3"
                    >
                      {post.title}
                    </Typography>

                    {post.excerpt && (
                      <Typography variant="body2" color="muted" className="block flex-1 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </Typography>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <Typography variant="body2" color="primary" weight="medium" className="block">
                        Читать →
                      </Typography>
                      <Typography variant="caption" color="muted" className="block">
                        {new Date(post.published_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Typography>
                    </div>
                  </div>

                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
