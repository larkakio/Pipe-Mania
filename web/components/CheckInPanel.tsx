'use client';

import {
  useWriteContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { pipeManiaCheckInAbi } from '@/lib/contracts/checkInAbi';

function parseAddress(raw: string | undefined): `0x${string}` | undefined {
  if (!raw?.startsWith('0x') || raw.length !== 42) return undefined;
  return raw as `0x${string}`;
}

export function CheckInPanel() {
  const contractAddress = parseAddress(
    process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS,
  );

  const { isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const {
    writeContractAsync,
    data: txHash,
    isPending: isWriting,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function handleCheckIn() {
    if (!contractAddress) return;
    reset();
    try {
      const baseId = base.id;
      await switchChainAsync({ chainId: baseId });
      await writeContractAsync({
        address: contractAddress,
        abi: pipeManiaCheckInAbi,
        functionName: 'checkIn',
        chainId: baseId,
        value: BigInt(0),
      });
    } catch {
      /* surfaced via wagmi error state */
    }
  }

  const busy = isSwitching || isWriting || isConfirming;

  if (!contractAddress) {
    return (
      <section className="border-t border-white/10 px-4 py-3 text-center text-[11px] text-white/45">
        Daily check-in contract address missing — set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS after deploy.
      </section>
    );
  }

  return (
    <section className="border-t border-cyan-500/20 bg-black/50 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <div className="font-display text-[10px] uppercase tracking-[0.4em] text-cyan-400/90">
          Daily on-chain check-in
        </div>
        <p className="text-[11px] leading-snug text-white/55">
          Gas-only transaction on Base mainnet — no ETH is sent to the contract.
        </p>
        <button
          type="button"
          disabled={!isConnected || busy}
          onClick={() => void handleCheckIn()}
          className="rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-600/25 to-fuchsia-600/25 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:border-cyan-300 hover:from-cyan-500/35 hover:to-fuchsia-500/35 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {busy ? 'Working…' : isSuccess ? 'Check-in confirmed' : 'Check in onchain'}
        </button>
        {error ? (
          <p className="text-[11px] text-red-400">{error.message}</p>
        ) : null}
      </div>
    </section>
  );
}
