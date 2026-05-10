import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { CONTAINER } from '@/config/sizes';

const API = 'http://localhost:5200';

const Explore = () => {
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
      <Typography variant="h2" weight="bold" className="block mb-2">
        Explore AI Effects
      </Typography>
      <Typography variant="body1" color="muted" className="block mb-10">
        Powerful AI tools to transform your images and files.
      </Typography>

      {loading ? (
        <Typography variant="body2" color="muted" className="block">Загрузка...</Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {effects.map((effect) => (
            <div
              key={effect.id}
              onClick={() => navigate(`/tools/${effect.slug}`)}
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
                <Typography variant="h4" weight="semibold">{effect.name}</Typography>
                {effect.short_desc && (
                  <Typography variant="body2" color="muted" className="block line-clamp-2">
                    {effect.short_desc}
                  </Typography>
                )}
                <Button size="sm" className="w-full mt-1">
                  Try it →
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
