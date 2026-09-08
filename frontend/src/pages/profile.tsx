import { ArrowRight, ChevronRight, Droplets, FileText, MapPin, Pencil, ShieldCheck, Sprout } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { useCurrentBlock } from '@/hooks/use-current-block';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const block = useCurrentBlock();

  return (
    <>
      <PageHeader title="Farmer profile" action={<button className="vm-icon-button" type="button" onClick={() => setEditing((value) => !value)}><Pencil size={17} /></button>} />
      <section className="vm-card vm-profile-card">
        <div className="vm-profile-avatar">RF</div>
        <div><h2>Raunak Farmer</h2><p><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {block ? `${block.District}, Karnataka` : 'Loading location...'}</p></div>
        <span className="vm-chip vm-profile-edit">{editing ? 'Editing' : 'Farmer'}</span>
      </section>
      <section className="vm-section" style={{ marginTop: 25 }}>
        <div className="vm-section-heading"><h2 className="vm-section-title">My farm details</h2>{editing ? <span className="vm-eyebrow">Tap save below</span> : null}</div>
        <div className="vm-card" style={{ padding: '4px 16px' }}>
          <div className="vm-farm-grid">
            <FarmDetail icon={<Sprout size={16} />} label="Primary crop" value="Rice (Paddy)" />
            <FarmDetail icon={<FileText size={16} />} label="Total land" value="3.5 Acres" />
            <FarmDetail icon={<FileText size={16} />} label="Soil type" value="Clay Loam" />
            <FarmDetail icon={<Droplets size={16} />} label="Irrigation" value="Rainfed & Borewell" />
          </div>
        </div>
      </section>
      <section className="vm-section">
        <div className="vm-section-heading"><h2 className="vm-section-title">Support & services</h2></div>
        <div className="vm-card vm-support-list">
          <button className="vm-support-button" type="button" onClick={() => window.alert('Noted.')}><span className="vm-support-icon"><ShieldCheck size={17} /></span><span><strong>Agricultural expert support</strong><span>Connect with an agronomist</span></span><ChevronRight size={17} /></button>
          <button className="vm-support-button" type="button" onClick={() => window.alert('Showing schemes.')}><span className="vm-support-icon"><FileText size={17} /></span><span><strong>Government subsidy info</strong><span>Kisan schemes & support</span></span><ChevronRight size={17} /></button>
        </div>
      </section>
      <section className="vm-section" style={{ marginTop: 26 }}>
        <button className="vm-outline-button" type="button" onClick={() => { setSaved(true); setEditing(false); }}>{saved ? 'Profile details saved' : editing ? 'Save profile details' : 'Edit profile details'} <ArrowRight size={15} style={{ verticalAlign: 'middle', marginLeft: 5 }} /></button>
      </section>
    </>
  );
}

function FarmDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="vm-farm-cell"><span>{icon} {label}</span><strong>{value}</strong></div>;
}