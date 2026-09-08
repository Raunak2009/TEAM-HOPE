import { type ReactNode } from 'react';
import { CloudSun, Home, Leaf, UserRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/lib/translations';

type AppShellProps = { children: ReactNode };


const navItems = [
  { href: '/home', labelKey: 'nav_home' as const, icon: Home },
  { href: '/weather', labelKey: 'nav_outlook' as const, icon: CloudSun },
  { href: '/crops', labelKey: 'nav_crops' as const, icon: Leaf },
  { href: '/profile', labelKey: 'nav_profile' as const, icon: UserRound },
];

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { language } = useLanguage();
  const t = useTranslation(language);
  return (
    <div className="vm-app">
      <div className="vm-shell">
        <main className="vm-content" key={location}>
  <div className="vm-page-enter">{children}</div>
</main>
        <nav className="vm-bottom-nav" aria-label="Primary navigation">
          {navItems.map(({ href, labelKey, icon: Icon }) => {
  const active = location === href;
  return (
    <Link href={href} key={href} className="vm-nav-link" data-active={active}>
      <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
      <span>{t(labelKey)}</span>
    </Link>
  );
})}
        </nav>
      </div>
    </div>
  );
}