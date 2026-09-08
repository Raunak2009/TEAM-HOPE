import { MapPin } from 'lucide-react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  location?: string;
  action?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, location, action }: PageHeaderProps) {
  return (
    <header className="vm-header">
      <div className="vm-greeting">
        <div>
          {eyebrow ? <p className="vm-eyebrow">{eyebrow}</p> : null}
          <h1 className="vm-title">{title}</h1>
          {location ? <div className="vm-location"><MapPin size={14} /> {location}</div> : null}
        </div>
        {action}
      </div>
    </header>
  );
}