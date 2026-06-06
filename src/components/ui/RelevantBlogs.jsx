import { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LangContext';
import { getRelatedBlogs } from '@/config/toolTags';
import LangLink from '@/components/routing/LangLink';

const API = 'http://localhost:5200';

const RelevantBlogs = ({ currentSlug }) => {
  const lang = useLang();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/blog/posts?lang=${lang}`)
      .then(r => r.json())
      .then(all => {
        if (!Array.isArray(all)) return;
        setPosts(getRelatedBlogs(currentSlug, all));
      })
      .catch(() => {});
  }, [currentSlug, lang]);

  if (!posts.length) return null;

  return (
    <div className="w-full max-w-[1440px] px-4">
      <h2 className="text-[40px] leading-[1.2] font-semibold mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map(post => (
          <LangLink
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
          >
            {post.cover_url ? (
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No image</span>
              </div>
            )}
            <div className="p-5 flex flex-col gap-2 flex-1">
              <p className="text-[18px] font-semibold leading-snug text-foreground group-hover:underline line-clamp-2">
                {post.title}
              </p>
              {post.excerpt && (
                <p className="text-[15px] text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt.slice(0, 100)}{post.excerpt.length > 100 ? '...' : ''}
                </p>
              )}
            </div>
          </LangLink>
        ))}
      </div>
    </div>
  );
};

export default RelevantBlogs;
