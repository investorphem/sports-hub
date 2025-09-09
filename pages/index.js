import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Client } from "@farcaster/hub-web";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { disconnect } = useDisconnect();
  const [casts, setCasts] = useState([]);

  useEffect(() => {
    async function fetchCasts() {
      try {
        const client = new Client("https://hub.pinata.cloud"); // free Farcaster hub
        const result = await client.getAllCastMessagesByFid({ fid: 2 });
        setCasts(result.messages || []);
      } catch (err) {
        console.error("Farcaster fetch failed:", err);
      }
    }
    fetchCasts();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">⚽ SportsHub MiniApp</h1>

      <div className="mt-4">
        {isConnected ? (
          <>
            <p>✅ Connected: {address}</p>
            <button
              onClick={() => disconnect()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-xl"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => connect()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">🔥 Farcaster Feed</h2>
        <ul className="mt-2 space-y-2">
          {casts.map((c, i) => (
            <li key={i} className="p-2 bg-gray-100 rounded">
              {c.data?.castAddBody?.text}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
