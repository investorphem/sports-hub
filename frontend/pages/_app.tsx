import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { FarcasterProvider } from '@farcaster/miniapp';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FarcasterProvider>
      <Component {...pageProps} />
    </FarcasterProvider>
  );
}
