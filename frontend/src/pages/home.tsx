import { ArrowRight, CloudRain, Leaf } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { StationPicker } from '@/components/station-picker';
import { useStation } from '@/context/station-context';
import { getOnsetPrediction, getBreakRisk, daysUntil } from '@/lib/api';
import { useCurrentBlock } from '@/hooks/use-current-block';
import { MapCard } from '@/components/map-card';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/lib/translations';
import { useCountUp } from '@/hooks/use-count-up';

export default function HomePage() {
  const { stationId } = useStation();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { data: onset } = useQuery({ queryKey: ['onset', stationId], queryFn: () => getOnsetPrediction(stationId) });
  const { data: risk } = useQuery({ queryKey: ['risk', stationId], queryFn: () => getBreakRisk(stationId) });
  const block = useCurrentBlock();

  const daysToOnset = daysUntil(onset?.predicted_onset_date);
  const animatedDays = useCountUp(daysToOnset);
  const riskLevel = risk?.break_risk?.level ?? 'unknown';

  return (
    <>
      <PageHeader eyebrow={stationId} title="Namaskar" location={block ? `${block.District}, Karnataka` : undefined} action={<StationPicker />} />

      <section className="vm-hero-weather">
        <div className="vm-eyebrow" style={{ color: 'rgba(245,255,240,.72)' }}>MONSOON WATCH</div>
        {!onset ? (
  <div className="vm-skeleton" style={{ width: 180, height: 60, marginTop: 8 }} />
) : onset?.error ? (
  <h2>No prediction<br />available yet</h2>
) : (
  <h2>Monsoon onset<br />in {daysToOnset !== null ? animatedDays : '—'} days</h2>
)}
        <div className="vm-weather-icon"><CloudRain size={30} /></div>
        {!onset ? (
  <div className="vm-skeleton" style={{ width: 140, height: 40, marginTop: 22 }} />
) : (
  <div className="vm-weather-number">{onset?.predicted_onset_date ?? '—'}</div>
)}
        <div className="vm-weather-meta">
          <span className={`vm-risk-badge ${riskLevel}`}>
  <span className="vm-risk-dot" />
  {t('risk_label')}: {t(`level_${riskLevel}` as any)}
</span>
          <span>Range: {onset?.confidence_low ?? '—'} to {onset?.confidence_high ?? '—'}</span>
        </div>
      </section>
            <section className="vm-section">
        <div className="vm-section-heading"><h2 className="vm-section-title">Your region</h2></div>
        <MapCard />
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '.7rem', fontWeight: 700 }}>
  <span><span style={{display:'inline-block',width:10,height:10,borderRadius:5,background:'#4a7a4f',marginRight:4}}/>Low</span>
  <span><span style={{display:'inline-block',width:10,height:10,borderRadius:5,background:'#e7b23c',marginRight:4}}/>Moderate</span>
  <span><span style={{display:'inline-block',width:10,height:10,borderRadius:5,background:'#c0392b',marginRight:4}}/>High</span>
</div>
      </section>

      <div className="vm-signal-row"></div>

      <div className="vm-signal-row">
        <div className="vm-card vm-signal">
          <div className="signal-icon"><Leaf size={16} /></div>
          <strong>{t('risk_label')}</strong>
          <p>{risk?.break_risk?.explanation ?? 'Checking...'}</p>
        </div>
        <div className="vm-card vm-signal">
          <div className="signal-icon"><CloudRain size={16} /></div>
          <strong>Confidence</strong>
          <p>{onset?.confidence_low && onset?.confidence_high ? `${onset.confidence_low} – ${onset.confidence_high}` : '—'}</p>
        </div>
      </div>

      <section className="vm-section">
        <div className="vm-section-heading">
          <h2 className="vm-section-title">Crop advisory</h2>
          <Link href="/crops">See advisory <ArrowRight size={13} style={{ verticalAlign: 'middle', marginLeft: 3 }} /></Link>
        </div>
        <Link href="/crops" className="vm-card vm-advisory-card">
          <div className="vm-crop-orb"><Leaf size={25} strokeWidth={1.8} /></div>
          <div>
            <h3>Rice (Paddy)</h3>
            <p>Tap for this station's current advisory</p>
          </div>
          <ArrowRight size={18} className="vm-advisory-arrow" />
        </Link>
      </section>
    </>
  );
}