import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Typography } from '@/components/ui/Typography';
import { Upload } from '@/components/ui/Upload';
import { Button } from '@/components/ui/Button';
import { CONTAINER } from '@/config/sizes';

const API = 'http://localhost:5200';

const ToolPage = () => {
  const { effectPath } = useParams();
  const [effect, setEffect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/effects/${effectPath}`)
      .then(({ data }) => setEffect(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [effectPath]);

  if (loading) return (
    <div className="py-24 text-center">
      <Typography variant="body2" color="muted">Загрузка...</Typography>
    </div>
  );

  if (notFound || !effect) return (
    <div className="py-24 text-center flex flex-col items-center gap-4">
      <Typography variant="h2" weight="semibold">Инструмент не найден</Typography>
      <Link to="/explore">
        <Button variant="outline" size="sm">← Все инструменты</Button>
      </Link>
    </div>
  );

  return (
    <div className={`py-12 ${CONTAINER.default}`}>
      {/* Nav */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        <Typography variant="body2" color="muted">Все инструменты</Typography>
      </Link>

      {/* Cover */}
      {effect.cover_url && (
        <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-8">
          <img src={effect.cover_url} alt={effect.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{effect.icon}</span>
        <Typography variant="h2" weight="bold" className="block">{effect.name}</Typography>
      </div>

      {effect.description && (
        <Typography variant="body1" color="muted" className="block mb-10 max-w-2xl">
          {effect.description}
        </Typography>
      )}

      {/* Coming soon */}
      <div className="border border-border rounded-2xl p-12 flex flex-col items-center gap-4 text-center bg-muted/20">
        <span className="text-6xl">{effect.icon}</span>
        <Typography variant="h3" weight="semibold">Coming Soon</Typography>
        <Typography variant="body2" color="muted" className="block max-w-md">
          Этот инструмент находится в разработке. Подпишитесь, чтобы узнать первым когда он появится.
        </Typography>
        <Upload className="w-full max-w-md mt-2" disabled />
        <Button disabled className="w-full max-w-md opacity-50">Generate</Button>
      </div>
    </div>
  );
};

export default ToolPage;
