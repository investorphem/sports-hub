import "@/styles/globals.css";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import {
  getDefaultWallets,
  RainbowKitProvider
} from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";

const { chains, publicClient } = configureChains(
  [base, mainnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "SportsHub MiniApp",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // keep secret in Vercel ENV
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
