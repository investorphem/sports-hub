require('dotenv').config();
const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const usdc = process.env.USDC_ADDRESS;
  if(!usdc) throw new Error("Set USDC_ADDRESS in env");

  const Badge = await hre.ethers.getContractFactory("Badge1155");
  const badge = await Badge.deploy("ipfs://Qm.../{id}.json");
  await badge.deployed();
  console.log("Badge1155:", badge.address);

  const NFT = await hre.ethers.getContractFactory("SeasonNFT");
  const nft = await NFT.deploy("SportsHub Season","SHSN");
  await nft.deployed();
  console.log("SeasonNFT:", nft.address);

  const Betting = await hre.ethers.getContractFactory("BettingMarket");
  const betting = await Betting.deploy(usdc);
  await betting.deployed();
  console.log("BettingMarket:", betting.address);

  // Optionally let betting contract be an approved setter on badge/nft:
  await badge.setApprovedSetter(betting.address, true);
  await nft.setApprovedSetter(betting.address, true);

  // write frontend env
  const envPath = path.join(__dirname, "../frontend/.env.local");
  const content = `
NEXT_PUBLIC_CONTRACT_ADDRESS=${betting.address}
NEXT_PUBLIC_BADGE_ADDRESS=${badge.address}
NEXT_PUBLIC_NFT_ADDRESS=${nft.address}
NEXT_PUBLIC_USDC_ADDRESS=${usdc}
  `.trim();
  fs.writeFileSync(envPath, content, 'utf8');
  console.log("Wrote frontend/.env.local");
}

main().catch((e)=>{ console.error(e); process.exit(1); });
