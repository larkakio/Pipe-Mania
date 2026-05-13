'use client';

import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletBar() {
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const prevOverflow = useRef<string | null>(null);

  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !sheetOpen) return;
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow.current ?? '';
    };
  }, [mounted, sheetOpen]);

  const wrongNetwork = isConnected && chainId !== base.id;

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const onOverlayKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') closeSheet();
    },
    [closeSheet],
  );

  const sheet =
    mounted && sheetOpen ? (
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/70 backdrop-blur-sm sm:justify-center sm:p-6"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closeSheet();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-sheet-title"
          tabIndex={-1}
          onKeyDown={onOverlayKeyDown}
          className="max-h-[min(70vh,520px)] overflow-hidden rounded-t-2xl border border-cyan-400/40 bg-[#070918] shadow-[0_0_40px_rgba(255,0,255,0.25)] sm:mx-auto sm:max-w-md sm:rounded-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 id="wallet-sheet-title" className="font-display text-sm tracking-wide text-cyan-300">
              Connect wallet
            </h2>
            <button
              type="button"
              aria-label="Close wallet picker"
              className="rounded-lg px-3 py-1 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={closeSheet}
            >
              ✕
            </button>
          </div>
          <div className="max-h-[55vh] overflow-y-auto px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-2">
            {connectors.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/60">
                No browser wallet detected. Open this app inside the Base App or install a wallet extension.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {connectors.map((connector) => (
                  <li key={connector.uid}>
                    <button
                      type="button"
                      disabled={isPending}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10 disabled:opacity-50"
                      onClick={() => {
                        connect(
                          { connector, chainId: base.id },
                          {
                            onSettled: () => setSheetOpen(false),
                          },
                        );
                      }}
                    >
                      <span>{connector.name}</span>
                      <span className="text-xs text-white/40">Base</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-cyan-500/25 bg-black/40 px-4 py-3 backdrop-blur-md">
        <div className="font-display text-xs uppercase tracking-[0.35em] text-fuchsia-400">
          Pipe Mania
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {wrongNetwork ? (
            <button
              type="button"
              className="rounded-full border border-amber-400/60 bg-amber-500/15 px-3 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/25"
              onClick={() => switchChain({ chainId: base.id })}
            >
              Wrong network — tap to switch to Base
            </button>
          ) : null}
          {isConnected && address ? (
            <>
              <span className="hidden font-mono text-[11px] text-cyan-200/90 sm:inline">
                {shortenAddress(address)}
              </span>
              <button
                type="button"
                className="rounded-full border border-fuchsia-500/50 px-4 py-2 text-xs uppercase tracking-wide text-fuchsia-100 hover:bg-fuchsia-500/15"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={status === 'connecting'}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_24px_rgba(0,255,255,0.35)] hover:brightness-110 disabled:opacity-60"
              onClick={() => setSheetOpen(true)}
            >
              Connect wallet
            </button>
          )}
        </div>
      </header>
      {mounted ? createPortal(sheet, document.body) : null}
    </>
  );
}
