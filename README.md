# ChainGuard

**Crypto portfolio security dashboard with real-time risk intelligence across seven chains.**

![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7-purple.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

ChainGuard is a single-page dashboard for monitoring DeFi portfolio risk in real time. It streams live prices over WebSocket, scores smart contracts for rug-pull indicators, tracks whale movements, compares gas costs across chains, and manages token approvals -- all from six free public APIs with zero configuration.

---

## Features

**Portfolio Dashboard** -- Live WebSocket price feeds, portfolio-level risk scoring (VaR, Sharpe ratio, max drawdown), and DeFi health factor monitoring with animated glassmorphism cards.

**Smart Contract Scanner** -- Honeypot detection, hidden mint analysis, tax evaluation, and liquidity lock verification powered by GoPlus Labs. Contracts receive a composite risk score from 0 to 100.

**Whale Tracker** -- Real-time large-transaction monitoring with buy/sell sentiment analysis sourced from Blockchair and CoinCap.

**Gas Optimizer** -- Cross-chain gas price comparison across six EVM chains and Solana, with four fee tiers and timing recommendations via Owlracle.

**Approval Manager** -- Surface unlimited token approvals, flag unverified contracts, and assess revocation priority based on risk severity.

**DeFi Protocol Monitor** -- TVL and yield tracking for major protocols (Aave, Uniswap, GMX, Lido, Curve, Compound) through DeFi Llama.

**Multi-Chain Support** -- Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Base, and Avalanche.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19, TypeScript 5.9 |
| Build Tool | Vite 7.3 |
| Styling | Tailwind CSS 4, Framer Motion 12 |
| Charts | Recharts 3.8 |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| State | React hooks (no external state library) |
| Data | CoinCap WebSocket, CoinGecko, GoPlus Labs, Owlracle, DeFi Llama, Blockchair |

All API responses are cached in memory with TTL ranging from 15 seconds (gas prices) to 300 seconds (contract scans). Stale data is served gracefully on API failure.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
git clone https://github.com/beepboop2025/chainguard.git
cd chainguard
npm install
```

### Development

```bash
npm run dev
```

The application opens at `http://localhost:5173`. No API keys are required -- all data sources use free public endpoints.

### Production Build

```bash
npm run build
npm run preview
```

### Linting and Type Checking

```bash
npm run lint
npm run typecheck
```

---

## Project Structure

```
src/
  pages/          Dashboard, Security, WhaleTracker, GasOptimizer, ThreatScanner
  components/     Shared UI components and layout shell
  services/       API clients (price, gas, threat, whale, DeFi) and caching layer
  hooks/          Custom React hooks (useLiveData)
  types/          TypeScript type definitions
  utils/          Shared utility functions
  data/           Static reference data
```

---

## License

This project is licensed under the [MIT License](LICENSE).
