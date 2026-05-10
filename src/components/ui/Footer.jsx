import { Link } from 'react-router-dom';
import { Typography } from '@/components/ui/Typography';

const Footer = () => (
  <footer className="border-t border-border mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <Typography variant="body2" color="muted">
        © {new Date().getFullYear()} FillTech. Все права защищены.
      </Typography>
      <div className="flex items-center gap-5">
        <Link to="/blog">
          <Typography variant="body2" color="muted" className="hover:text-foreground transition-colors">
            Блог
          </Typography>
        </Link>
        <Link to="/explore">
          <Typography variant="body2" color="muted" className="hover:text-foreground transition-colors">
            Инструменты
          </Typography>
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
