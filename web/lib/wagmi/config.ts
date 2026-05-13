import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected, baseAccount, walletConnect } from 'wagmi/connectors';
import type { Hex } from 'viem';
import { Attribution } from 'ox/erc8021';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export function getBuilderDataSuffix(): Hex | undefined {
  const suffixHex = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (suffixHex?.startsWith('0x')) {
    return suffixHex as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code) return undefined;
  return Attribution.toDataSuffix({ codes: [code] });
}

const connectors = [
  injected(),
  baseAccount({
    appName: 'Pipe Mania',
  }),
  ...(projectId
    ? [
        walletConnect({
          projectId,
          showQrModal: true,
          metadata: {
            name: 'Pipe Mania',
            description: 'Cyberpunk pipe puzzle on Base',
            url:
              process.env.NEXT_PUBLIC_SITE_URL ??
              'https://pipe-mania.example',
            icons: ['/app-icon.jpg'],
          },
        }),
      ]
    : []),
];

const builderDataSuffix = getBuilderDataSuffix();

export const config = createConfig({
  chains: [base, mainnet],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ...(builderDataSuffix ? { dataSuffix: builderDataSuffix } : {}),
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
