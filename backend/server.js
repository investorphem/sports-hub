require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_FOOTBALL_KEY;
const PORT = process.env.PORT || 8080;
const BASE_RPC = process.env.BASE_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  "function resolveMarket(uint256 matchId, uint8 winningOutcome) external",
  "function registerWin(address user) external"
];

app.get('/api/fixtures', async (req, res) => {
  try {
    const league = req.query.league || '39';
    const from = req.query.from || new Date().toISOString().slice(0,10);
    const to = req.query.to || new Date(Date.now()+7*24*3600*1000).toISOString().slice(0,10);
    const url = `https://v3.football.api-sports.io/fixtures?league=${league}&from=${from}&to=${to}`;
    const response = await axios.get(url, { headers: { 'x-apisports-key': API_KEY }});
    res.json(response.data);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'failed' });
  }
});

app.get('/api/standings', async (req, res) => {
  try {
    const league = req.query.league || '39';
    const season = req.query.season || '2024';
    const url = `https://v3.football.api-sports.io/standings?league=${league}&season=${season}`;
    const response = await axios.get(url, { headers: { 'x-apisports-key': API_KEY }});
    res.json(response.data);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'failed' });
  }
});

/**
 * Admin only: resolve market on-chain (server must be owner on contract or have permission)
 * body: { matchId: 12345, winningOutcome: 1, secret: <ADMIN_SECRET> }
 */
app.post('/api/resolve', async (req, res) => {
  try {
    const { matchId, winningOutcome, secret } = req.body;
    if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'unauthorized' });

    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    const tx = await contract.resolveMarket(matchId, winningOutcome);
    const rcpt = await tx.wait();
    res.json({ txHash: rcpt.transactionHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'resolve failed', details: err.message });
  }
});

app.listen(PORT, ()=> console.log(`Backend listening on ${PORT}`));
