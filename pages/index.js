import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract } from 'wagmi';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const handleTestBet = async () => {
    try {
      // ⚠️ Placeholder: send 0.01 ETH on Base to yourself (test transaction)
      await writeContract({
        address: address,
        abi: [
          {
            "inputs": [],
            "name": "fallback",
            "stateMutability": "payable",
            "type": "fallback"
          }
        ],
        functionName: 'fallback',
        value: BigInt(10000000000000000), // 0.01 ETH
      });
    } catch (err) {
      console.error("Bet error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sports Hub 🏆</h1>

      <ConnectButton />

      {isConnected && (
        <div className="mt-4">
          <p className="mb-2">Connected: {address}</p>
          <button
            onClick={handleTestBet}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Place Test Bet
          </button>
        </div>
      )}
    </div>
  );
}
