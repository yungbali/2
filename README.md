# Claude Forkoor 🔪

> **The Rug Stops Here. Forked, Fixed, and Fired Up.**

Claude Forkoor is an automated "Contract Surgeon" for Solana. It monitors the chaos of pump.fun launches, identifies architectural flaws (mint/freeze authorities, high holder concentration, mutable metadata), and instantly offers a "Safe Fork" – a superior version with zero rug vectors.

![Claude Forkoor Banner](./docs/banner.png)

## 🎯 Core Features

### 🔍 The "Rug-Scanner" (Sentinel)
- Real-time monitoring of pump.fun and Raydium launches
- Integration with RugCheck API for comprehensive risk analysis
- Flags "High Risk" tokens within 30 seconds of launch
- On-chain verification of mint/freeze authorities

### 📋 The Metadata Cloner
- Programmatically scrapes name, symbol, and IPFS image
- Generates "SAFE_" prefixed variants
- Preserves original branding while marking as a safe fork

### 🔐 Token-2022 Safe Forks
- Deploys using Token-2022 Standard with Transfer Fee extension
- **0.5% transfer fee** → FORK Treasury
- Mint and Freeze authorities revoked in the same transaction
- Metadata is locked and immutable

### 🤝 The Migration Hub
- UI for rug victims to claim relief tokens
- Wallet verification against rugged token holdings
- Fair allocation based on original holdings
- One-click claiming process

### 💰 The FORK-Vault Treasury
- Automatic fee collection from all safe forks
- **The Ralph Loop**: Every $1,000 triggers a $FORK buyback
- Transparent on-chain accounting
- Community-owned value growth

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Solana CLI (optional, for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/claudeforkoor/claude-forkoor.git
cd claude-forkoor

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
```

### Configuration

Create a `.env` file with:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
DEPLOYER_PRIVATE_KEY=your_base58_private_key

# Treasury Configuration
FORK_TOKEN_MINT=your_fork_token_mint
TREASURY_WALLET=your_treasury_wallet
BUYBACK_THRESHOLD_USD=1000

# API Configuration
RUGCHECK_API_URL=https://api.rugcheck.xyz/v1
```

## 📦 Project Structure

```
claude-forkoor/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/           # App router pages
│       │   └── components/    # React components
│       └── package.json
├── packages/
│   ├── core/                   # Shared types, utils, config
│   ├── scanner/                # Rug-Scanner (Sentinel)
│   ├── forker/                 # Token-2022 deployment
│   └── treasury/               # Fee collection & buybacks
├── scripts/
│   └── metaplex-metadata-clone.ts
├── package.json
└── README.md
```

## 🛠️ Usage

### Start the Scanner

```bash
npm run scanner
```

Monitors pump.fun and Raydium for new token launches, analyzes them for rug vectors.

### Clone Token Metadata

```bash
npm run clone-metadata -- <mint_address>
```

Extracts metadata from a token and prepares it for a safe fork.

### Deploy a Safe Fork

```bash
npm run deploy-fork -- \
  --original <original_mint> \
  --treasury <treasury_wallet> \
  --name "SAFE_TOKEN" \
  --symbol "SAFE_T"
```

### Start the Frontend

```bash
npm run web
```

Launches the Next.js dashboard at `http://localhost:3000`

### Treasury Buyback

```bash
# Check balance and execute buyback if threshold reached
npm run treasury:buyback -- 1000

# Estimate buyback output
npm run treasury:buyback -- estimate 500
```

## 🔄 The Ralph Loop (Feedback Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE RALPH LOOP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │  DETECT  │ ──▶ │  FORK    │ ──▶ │  TRADE   │               │
│   │   Rug    │     │  Token   │     │  Safe    │               │
│   └──────────┘     └──────────┘     └──────────┘               │
│                                          │                      │
│                                          ▼                      │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │  EXPAND  │ ◀── │  BUYBACK │ ◀── │  COLLECT │               │
│   │ Coverage │     │  $FORK   │     │  0.5%    │               │
│   └──────────┘     └──────────┘     └──────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

1. **Detection**: Claude identifies risky tokens with live authorities
2. **Action**: Deploys a safe fork with revoked authorities
3. **Validation**: Users migrate to the safe fork
4. **Revenue**: 0.5% transfer fees accumulate in treasury
5. **Pump**: Every $1,000 triggers automatic $FORK buyback
6. **Growth**: Rising $FORK enables more monitoring and faster forks

## 📊 API Reference

### Scanner Service

```typescript
import { ScannerService } from '@forkoor/scanner';

const scanner = new ScannerService();

// Start monitoring
await scanner.start();

// Scan a specific token
const assessment = await scanner.scanToken('mint_address');

console.log(assessment.riskScore);  // 0-100
console.log(assessment.riskLevel);  // LOW | MEDIUM | HIGH | CRITICAL
console.log(assessment.forkable);   // boolean
```

### Forker Service

```typescript
import { deployFork } from '@forkoor/forker';

const result = await deployFork({
  originalMint: 'rugged_token_mint',
  treasuryWallet: 'treasury_address',
  name: 'SAFE_TOKEN',
  symbol: 'SAFE_T',
  transferFeeBps: 50,  // 0.5%
});

console.log(result.mint);      // New safe token mint
console.log(result.deployTx);  // Deployment transaction
console.log(result.revokeTx);  // Authority revocation transaction
```

### Treasury Service

```typescript
import { TreasuryService } from '@forkoor/treasury';

const treasury = new TreasuryService();

// Start automated fee collection and buybacks
await treasury.start();

// Get statistics
const stats = treasury.getStats();
console.log(stats.totalFeesCollected);
console.log(stats.totalBuybackAmount);
```

## 🎨 Frontend

The Claude Forkoor dashboard features a **Medical/Surgeon** themed UI:

- **Dark theme** with surgical green (#00e6ac) accents
- **Cyberpunk medical** aesthetic
- **Real-time** token monitoring
- **Wallet integration** with Phantom and Solflare

### Pages

- `/` - Landing page with hero and features
- `/dashboard` - Real-time rug scanner
- `/migrate` - Migration hub for victims
- `/forks` - List of all safe forks

## 🔒 Security

All safe forks deployed by Claude Forkoor have:

- ✅ **Mint Authority Revoked** - Cannot print new tokens
- ✅ **Freeze Authority Revoked** - Cannot freeze wallets
- ✅ **Metadata Immutable** - Cannot change token identity
- ✅ **Transfer Fee** - 0.5% to treasury, funding the ecosystem

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build all packages
npm run build
```

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- **Website**: [claudeforkoor.xyz](https://claudeforkoor.xyz)
- **Twitter**: [@ClaudeForkoor](https://twitter.com/ClaudeForkoor)
- **Telegram**: [t.me/claudeforkoor](https://t.me/claudeforkoor)
- **RugCheck**: [rugcheck.xyz](https://rugcheck.xyz)

---

<p align="center">
  <strong>"I find the bugs. I fix the contracts. I fork the future."</strong>
</p>

<p align="center">
  Built with 🩺 by Claude Forkoor
</p>
