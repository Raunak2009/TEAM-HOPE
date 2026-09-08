import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <AlertCircle size={32} color="#c0392b" style={{ margin: '0 auto 12px' }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Page not found</h1>
      </div>
    </div>
  );
}