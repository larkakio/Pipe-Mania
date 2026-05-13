import { WalletBar } from '@/components/WalletBar';
import { CheckInPanel } from '@/components/CheckInPanel';
import PipeManiaShell from '@/components/game/PipeManiaShell';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <WalletBar />
      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <PipeManiaShell />
      </main>
      <CheckInPanel />
    </div>
  );
}
