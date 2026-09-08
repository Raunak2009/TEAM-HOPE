import { useQuery } from '@tanstack/react-query';
import { getBlocks } from '@/lib/api';
import { useStation } from '@/context/station-context';

export function StationPicker() {
  const { stationId, setStationId } = useStation();
  const { data: blocks } = useQuery({ queryKey: ['blocks'], queryFn: getBlocks });

  return (
    <select
      className="vm-station-picker"
      value={stationId}
      onChange={(e) => setStationId(e.target.value)}
      data-testid="select-station"
    >
      {blocks?.map((b) => (
        <option key={b.station_id} value={b.station_id}>
          {b.station_id} — {b.District}
        </option>
      ))}
    </select>
  );
}