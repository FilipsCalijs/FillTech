import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Typography } from '@/components/ui/Typography';

const FAQSection = ({ title = 'Frequently Asked Questions', faqs = [] }) => {
  const [open, setOpen] = useState(null);

  return (
    <div className="w-full max-w-[1280px] px-4">
      <Typography variant="h1" weight="semibold" className="mb-8 block">
        {title}
      </Typography>
      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/40 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <Typography variant="body1" weight="medium">{faq.q}</Typography>
              <ChevronDown
                size={18}
                className={`shrink-0 ml-4 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${open === i ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className="px-5 pb-5">
                <Typography variant="body2" color="muted">{faq.a}</Typography>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
