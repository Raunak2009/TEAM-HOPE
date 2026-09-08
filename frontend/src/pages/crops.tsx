import { Droplets, Leaf, Sprout, SunMedium } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { StationPicker } from '@/components/station-picker';
import { useStation } from '@/context/station-context';
import { getAdvisory, getOnsetPrediction, sendAdvisoryWhatsApp } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { useCurrentBlock } from '@/hooks/use-current-block';

const crops = [
  { id: 'paddy', label: 'Rice (Paddy)', soil: 'Moist / Clay loam', water: '45–60 mm' },
  { id: 'maize', label: 'Maize', soil: 'Well-drained loam', water: '35–45 mm' },
  { id: 'ragi', label: 'Ragi', soil: 'Red loam', water: '25–35 mm' },
];

export default function CropsPage() {
  const { stationId } = useStation();
  const [selected, setSelected] = useState('paddy');
  const crop = crops.find((c) => c.id === selected) ?? crops[0];
  const block = useCurrentBlock();

  const { data: onset } = useQuery({ queryKey: ['onset', stationId], queryFn: () => getOnsetPrediction(stationId) });
 const { language } = useLanguage();

const { data: advisory } = useQuery({
  queryKey: ['advisory', stationId, selected, language],
  queryFn: () => getAdvisory(stationId, selected, language),
});

  return (
    <>
      <PageHeader eyebrow="Decisions for this season" title="Crop advisory" location={block ? `${block.District}, Karnataka` : undefined} action={<StationPicker />} />
      <div className="vm-crop-tabs" role="tablist">
        {crops.map((item) => (
          <button className="vm-crop-tab" type="button" data-selected={selected === item.id} key={item.id} onClick={() => setSelected(item.id)}>{item.label}</button>
        ))}
      </div>
      <section className="vm-card vm-crop-summary">
        <div className="vm-crop-summary-top">
          <div className="vm-crop-orb"><Sprout size={25} /></div>
          <div><h2>{crop.label}</h2><p>Based on {stationId}'s current outlook</p></div>
          <span className="vm-chip vm-crop-pill"><Leaf size={13} /> {advisory?.break_risk_level ?? '—'}</span>
        </div>
        <div className="vm-detail-grid">
          <div><span>Predicted onset</span><strong>{onset?.predicted_onset_date ?? '—'}</strong></div>
          <div><span>Confidence range</span><strong>{onset?.confidence_low ?? '—'} to {onset?.confidence_high ?? '—'}</strong></div>
          <div><span>Water requirement</span><strong>{crop.water}</strong></div>
          <div><span>Soil condition</span><strong>{crop.soil}</strong></div>
        </div>
      </section>
      <section className="vm-section" style={{ marginTop: 26 }}>
  <div className="vm-card vm-advisory-card"><div className="vm-crop-orb"><Droplets size={22} /></div><div><h3>Advisory</h3><p>{advisory?.advisory_text ?? 'Loading advisory...'}</p></div><SunMedium size={18} style={{ marginLeft: 'auto', color: 'hsl(var(--accent-foreground))' }} /></div>
  <button
    type="button"
    className="vm-continue"
    style={{ marginTop: 12 }}
    onClick={async () => {
  const phone = prompt("Enter WhatsApp number (with country code, e.g. +91XXXXXXXXXX):");
  if (phone) {
    const result = await sendAdvisoryWhatsApp(stationId, selected, phone, language);
    alert(`Demo preview - this message would be sent to ${phone}:\n\n"${result.message_preview}"`);
  }
}}
  >
    Send via WhatsApp
  </button>
</section>
    </>
  );
}