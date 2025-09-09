import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { ethers } from "ethers";
import { useFarcasterWallet, useFarcasterCast } from "@farcaster/miniapp";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const BADGE_ADDRESS = process.env.NEXT_PUBLIC_BADGE_ADDRESS || "";
const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS || "";
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || ""; // set in Vercel/GH Actions

const CONTRACT_ABI = [
  "function placeBet(uint256 matchId,uint8 outcome,uint256 amount) external",
  "function claim(uint256 matchId) external",
  "function createMarket(uint256 matchId) external",
  "event BetPlaced(address indexed user,uint256 indexed matchId,uint8 outcome,uint256 amount)"
];
const BADGE_ABI = [
  "function balanceOf(address account,uint256 id) view returns (uint256)",
  "function claimBadge(uint256 id) external"
];
const NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function claimSeasonNFT() external"
];
const ERC20_ABI = [
  "function approve(address spender,uint256 amount) public returns (bool)",
  "function allowance(address owner,address spender) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
];

export default function Home() {
  const [tab, setTab] = useState<"fixtures"|"betting"|"profile">("fixtures");
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [selected, setSelected] = useState<any|null>(null);
  const [betAmount, setBetAmount] = useState<string>("5");
  const [badges, setBadges] = useState<number[]>([]);
  const [hasNFT, setHasNFT] = useState(false);

  const { account, connect, disconnect, provider } = useFarcasterWallet();
  const { cast } = useFarcasterCast();

  useEffect(()=>{ fetchFixtures() }, []);
  useEffect(()=>{ if(account && provider) fetchProfile() }, [account, provider]);

  async function fetchFixtures() {
    try {
      const res = await axios.get("/api/fixtures?league=39"); // API-Football Premier League example
      setFixtures(res.data.response || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProfile(){
    if(!provider || !account) return;
    const signer = await provider.getSigner();
    const badge = new ethers.Contract(BADGE_ADDRESS, BADGE_ABI, signer);
    const nft = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
    const owned:number[] = [];
    for(let i=1;i<=5;i++){
      try{
        const b = await badge.balanceOf(account, i);
        if(Number(b) > 0) owned.push(i);
      }catch{}
    }
    setBadges(owned);
    try{
      const n = await nft.balanceOf(account);
      setHasNFT(Number(n) > 0);
    }catch{}
  }

  async function placeBet(outcome:number){
    if(!account || !provider){ await connect(); return; }
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
    const decimals = await erc20.decimals();
    const amt = ethers.parseUnits(betAmount, decimals);
    const allowance = await erc20.allowance(account, CONTRACT_ADDRESS);
    if(allowance < amt){
      const tx = await erc20.approve(CONTRACT_ADDRESS, amt);
      await tx.wait();
    }
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI as any, signer);
    const tx = await contract.placeBet(selected.fixture.id, outcome, amt);
    await tx.wait();
    const slip = `🎟️ Bet Placed: ${selected.teams.home.name} vs ${selected.teams.away.name} — ${outcome===1?"Home": outcome===2?"Draw":"Away"} | ${betAmount} USDC`;
    try{ await cast(slip) }catch(e){ console.warn("Cast failed", e) }
    alert("Bet placed & (attempted) shared to Farcaster");
  }

  async function claimBadge(id:number){
    if(!provider) return;
    const signer = await provider.getSigner();
    const badge = new ethers.Contract(BADGE_ADDRESS, BADGE_ABI, signer);
    const tx = await badge.claimBadge(id);
    await tx.wait();
    fetchProfile();
  }

  async function claimNFT(){
    if(!provider) return;
    const signer = await provider.getSigner();
    const nft = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
    const tx = await nft.claimSeasonNFT();
    await tx.wait();
    fetchProfile();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 space-y-6">
        <div className="flex gap-3">
          <button className={`px-4 py-2 rounded ${tab==='fixtures'?'bg-indigo-600':'bg-slate-800'}`} onClick={()=>setTab('fixtures')}>Fixtures</button>
          <button className={`px-4 py-2 rounded ${tab==='betting'?'bg-indigo-600':'bg-slate-800'}`} onClick={()=>setTab('betting')}>Betting</button>
          <button className={`px-4 py-2 rounded ${tab==='profile'?'bg-indigo-600':'bg-slate-800'}`} onClick={()=>setTab('profile')}>Profile</button>

          {!account ? (
            <button className="ml-auto px-4 py-2 bg-emerald-600 rounded" onClick={connect}>Connect Wallet</button>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-800 rounded">{account.slice(0,6)}...{account.slice(-4)}</span>
              <button className="px-3 py-1 bg-rose-600 rounded" onClick={disconnect}>Disconnect</button>
            </div>
          )}
        </div>

        {tab==='fixtures' && (
          <section>
            <h2 className="text-xl font-semibold">Fixtures (live/upcoming)</h2>
            <div className="grid gap-2 mt-3">
              {fixtures.map((f:any)=>(
                <div key={f.fixture.id} className="p-3 bg-slate-800 rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{f.teams.home.name} vs {f.teams.away.name}</div>
                    <div className="text-sm text-slate-400">{new Date(f.fixture.date).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-sky-600 rounded" onClick={()=>{setSelected(f); setTab('betting')}}>Open</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab==='betting' && (
          <section>
            <h2 className="text-xl font-semibold">Betting</h2>
            {!selected ? (<div className="p-4 bg-slate-800 rounded mt-3">Select a fixture first</div>) : (
              <div className="p-4 bg-slate-800 rounded mt-3 space-y-4">
                <div className="flex justify-between">
                  <div>
                    <div className="text-lg font-semibold">{selected.teams.home.name} vs {selected.teams.away.name}</div>
                    <div className="text-sm text-slate-400">{new Date(selected.fixture.date).toLocaleString()}</div>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    Score: {selected.goals.home} — {selected.goals.away}<br/>Status: {selected.fixture.status.short}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input value={betAmount} onChange={(e)=>setBetAmount(e.target.value)} className="p-2 rounded bg-slate-700 w-40" />
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 rounded" onClick={()=>placeBet(1)}>Bet Home</button>
                    <button className="px-3 py-1 bg-amber-600 rounded" onClick={()=>placeBet(2)}>Bet Draw</button>
                    <button className="px-3 py-1 bg-rose-600 rounded" onClick={()=>placeBet(3)}>Bet Away</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {tab==='profile' && (
          <section>
            <h2 className="text-xl font-semibold">Profile</h2>
            <div className="p-4 bg-slate-800 rounded mt-3 space-y-4">
              <div>
                <div className="font-semibold">Badges</div>
                <div className="mt-2">
                  {badges.length===0 ? <div>No badges yet</div> : <div className="flex gap-2">{badges.map(b => <div key={b} className="px-3 py-1 bg-indigo-600 rounded">Badge #{b}</div>)}</div>}
                </div>
                <div className="mt-2">
                  <button className="px-3 py-1 bg-emerald-600 rounded" onClick={()=>claimBadge(1)}>Claim First Bet Badge</button>
                </div>
              </div>

              <div>
                <div className="font-semibold">Season NFT</div>
                <div className="mt-2">{hasNFT ? "You own the Season NFT 🎉" : <button className="px-3 py-1 bg-purple-600 rounded" onClick={claimNFT}>Claim Season NFT</button>}</div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
