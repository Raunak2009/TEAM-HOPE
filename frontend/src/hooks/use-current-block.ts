import { useQuery } from '@tanstack/react-query';
import { getBlocks } from '@/lib/api';
import { useStation } from '@/context/station-context';

export function useCurrentBlock() {
  const { stationId } = useStation();
  const { data: blocks } = useQuery({ queryKey: ['blocks'], queryFn: getBlocks });
  return blocks?.find((b) => b.station_id === stationId);
}