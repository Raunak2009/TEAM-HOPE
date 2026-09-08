import { ArrowRight, Check, Languages, Sprout } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/context/language-context';

const languages = [
  { id: 'english', label: 'English', native: 'English', code: 'en' },
  { id: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn' },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const continueToHome = () => {
    const chosen = languages.find((l) => l.id === selectedLanguage);
    setLanguage(chosen?.code ?? 'en');
    setLocation('/home');
  };

  return (
    <div className="vm-onboarding">
      <div className="vm-onboarding-inner">
        <div className="vm-onboarding-copy">
          <div className="vm-hope-logo" role="img" aria-label="HOPE">
            <span className="vm-hope-logo-mark"><Sprout size={28} strokeWidth={1.8} /></span>
            <span className="vm-hope-logo-word font-display">HOPE</span>
          </div>
          <p className="vm-tagline">Know The Rain,</p>
          <p className="vm-tagline">Grow The Grain.</p>
        </div>
        <section className="vm-language-panel">
          <label><Languages size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Choose your language</label>
          <div className="vm-language-options">
            {languages.map((language) => {
              const selected = selectedLanguage === language.id;
              return (
                <button key={language.id} type="button" className="vm-language-option" data-selected={selected} onClick={() => setSelectedLanguage(language.id)}>
                  <span>{language.native}</span>
                  {selected ? <Check size={16} /> : null}
                </button>
              );
            })}
          </div>
          <button type="button" className="vm-continue" onClick={continueToHome}>
            Continue <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </button>
        </section>
      </div>
    </div>
  );
}