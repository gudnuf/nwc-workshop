import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NDKProvider } from "@/hooks/useNdk";

export default function App({ Component, pageProps }: AppProps) {
  const defaultRelays = [process.env.NEXT_PUBLIC_NWC_LISTEN_RELAY!]

  return (
    <NDKProvider relays={defaultRelays}>
      <Component {...pageProps} />
    </NDKProvider>
  );
}
