import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { getRiskMap } from '@/lib/api';
import { useStation } from '@/context/station-context';
import 'leaflet/dist/leaflet.css';

const RISK_COLORS: Record<string, string> = {
  low: '#4a7a4f',
  moderate: '#e7b23c',
  high: '#c0392b',
  unknown: '#9a9a9a',
};

export function MapCard() {
  const { stationId, setStationId } = useStation();
  const { data: blocks } = useQuery({ queryKey: ['risk-map'], queryFn: getRiskMap });

  if (!blocks || blocks.length === 0) return null;
  const current = blocks.find((b) => b.station_id === stationId);
  const center: [number, number] = current ? [current.Latitude, current.Longitude] : [15.3, 75.7];

  return (
    <div className="vm-card" style={{ overflow: 'hidden', height: 260, marginTop: 4 }}>
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {blocks.map((b) => (
          <CircleMarker
            key={b.station_id}
            center={[b.Latitude, b.Longitude]}
            radius={b.station_id === stationId ? 10 : 5}
            pathOptions={{
              color: '#1b3a24',
              fillColor: RISK_COLORS[b.risk_level] || RISK_COLORS.unknown,
              fillOpacity: 0.85,
              weight: b.station_id === stationId ? 2 : 1,
            }}
            eventHandlers={{ click: () => setStationId(b.station_id) }}
          >
            <Popup>{b.station_id} — {b.District} — Risk: {b.risk_level}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}