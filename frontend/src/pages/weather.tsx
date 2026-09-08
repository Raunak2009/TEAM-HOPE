import { CloudDrizzle, Droplets, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { StationPicker } from '@/components/station-picker';
import { useStation } from '@/context/station-context';
import { getOnsetPrediction, getBreakRisk } from '@/lib/api';
import { useCurrentBlock } from '@/hooks/use-current-block';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/lib/translations';


export default function WeatherPage() {
  const { stationId } = useStation();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { data: onset } = useQuery({ queryKey: ['onset', stationId], queryFn: () => getOnsetPrediction(stationId) });
  const { data: risk } = useQuery({ queryKey: ['risk', stationId], queryFn: () => getBreakRisk(stationId) });
  const block = useCurrentBlock();

  const level = risk?.break_risk?.level ?? 'unknown';

  return (
    <>
      <PageHeader eyebrow="Monsoon outlook" title="Outlook" location={block ? `${block.District}, Karnataka` : undefined} action={<StationPicker />} />

      <section className="vm-weather-hero">
        <div className="vm-weather-hero-top">
          <div>
            <div className="vm-eyebrow" style={{ color: 'rgba(244,255,241,.72)' }}>{stationId}</div>
            <h2>{t('risk_label')}: {t(`level_${level}` as any)}</h2>
          </div>
          <CloudDrizzle size={41} strokeWidth={1.5} />
        </div>
        <div className="big-temp" style={{ fontSize: '2rem' }}>{onset?.predicted_onset_date ?? '—'}</div>
        <div className="weather-status">{t(`risk_copy_${level}` as any)}</div>
        <div className="vm-metrics">
          <div className="vm-metric"><span>Predicted onset</span><strong>{onset?.predicted_onset_date ?? '—'}</strong></div>
          <div className="vm-metric"><span>Earliest likely</span><strong>{onset?.confidence_low ?? '—'}</strong></div>
          <div className="vm-metric"><span>Latest likely</span><strong>{onset?.confidence_high ?? '—'}</strong></div>
        </div>
      </section>

      <section className="vm-section" style={{ marginTop: 26 }}>
        <div className="vm-section-heading">
          <h2 className="vm-section-title">Why this risk level</h2>
          <span className="vm-chip"><Droplets size={13} /> {risk?.break_risk?.score != null ? `${Math.round(risk.break_risk.score * 100)}%` : '—'}</span>
        </div>
        <div className="vm-card" style={{ padding: 16 }}>
          <p style={{ fontSize: '.82rem', lineHeight: 1.5 }}>{risk?.break_risk?.explanation ?? 'No recent rainfall data available for this window.'}</p>
        </div>
      </section>

      <section className="vm-section">
        <div className="vm-card vm-advisory-card">
          <div className="vm-crop-orb"><Leaf size={22} /></div>
          <div><h3>What this means for your field</h3><p>See the Crops tab for a crop-specific recommendation based on this outlook.</p></div>
        </div>
      </section>
    </>
  );
}