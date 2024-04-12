import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useNdk } from "@/hooks/useNdk";
import useNwc from "@/hooks/useNwc";
import { NDKFilter } from "@nostr-dev-kit/ndk";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [budgetSat, setBudgetSat] = useState<number | undefined>(undefined);
  const [expiryUnix, setExpiryUnix] = useState<number | undefined>(undefined);
  const [uri, setUri] = useState("");

  const { ndk, keyPair: { privateKey, publicKey }, subscribeAndHandle } = useNdk();
  const { generateNwcUri, handleNwcRequest } = useNwc({
    ndk,
    privateKey,
    publicKey
  });

  const handleGenerateUri = () => {
    const uri = generateNwcUri({ budgetSat, expiryUnix })

    setUri(uri)
  }

  /**
   * Create a new NDK subscription to `{ "kinds": [23194], "#p": <wallet_pubkey>}`
   * Subscription will stay open
   */
  useEffect(() => {
    if (!publicKey) {
      return;
    }
   
    // request: kind 23194, pTag = our pubkey
    const filter: NDKFilter = {
      kinds: [23194],
      '#p': [publicKey],
      since: Math.floor(Date.now() / 1000) // only look at events from after page loads
    };
 
    console.log("SUBSCRIBING TO: ", filter)
 
    // subscribe to filter and pass incoming events to nwc request handler
    // NOTE: closeOnEose: false will keep the subscription open
    subscribeAndHandle(filter, handleNwcRequest, { closeOnEose: false })
  }, [publicKey]) 

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}
    >
      <h2 className="text-5xl mb-3">This is a Wallet!</h2>

      <div>
        <div className="flex flex-col text-black">
          <div className="flex flex-col mb-3">
            <label>Budget Sat</label>
            <input
              type="number"
              value={budgetSat?.toString()}
              onChange={(e) => setBudgetSat(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col mb-3 text-black">
            <label>Expiry</label>
            <input
              type="date"
              value={expiryUnix}
              onChange={(e) => setExpiryUnix(Math.floor(new Date(e.target.value).getTime() / 1000))}
            />
          </div>
          <button
            className="btn btn-blue mb-3"
            onClick={handleGenerateUri}>
            Generate URI
          </button>
        </div>

        {/* Only show uri if it has a value */}
        {uri && <p><strong>NWC URI:</strong> <span>{uri}</span></p>}
      </div>
    </main>
  );
}
