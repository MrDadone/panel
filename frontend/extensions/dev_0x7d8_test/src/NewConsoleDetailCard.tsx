import { StatCard } from '@/pages/server/console/ServerDetails.tsx';
import { faMemory } from '@fortawesome/free-solid-svg-icons';
import { useServerStore } from '@/stores/server';

export default function NewConsoleDetailCard() {
  const server = useServerStore((state) => state.server);

  return <StatCard icon={faMemory} label='This is a test' value={`and this server is called ${server.name}`} />;
}
