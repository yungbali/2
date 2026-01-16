# Configuration Guide

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Required Configuration

```bash
# Solana RPC Configuration
# Use a reliable RPC provider for production (Helius, QuickNode, etc.)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com

# Deployer Wallet
# Base58 encoded private key for the deployer wallet
# This wallet deploys safe forks and pays for transactions
# NEVER commit this to version control!
DEPLOYER_PRIVATE_KEY=your_base58_private_key_here
```

### Treasury Configuration

```bash
# $FORK Token Mint Address
# The governance token that receives buybacks
FORK_TOKEN_MINT=your_fork_token_mint_address

# Treasury Wallet
# Wallet that receives transfer fees from safe forks
TREASURY_WALLET=your_treasury_wallet_address

# Buyback Threshold (in USD)
# Amount that triggers an automatic $FORK buyback
BUYBACK_THRESHOLD_USD=1000
```

### API Configuration

```bash
# RugCheck API
RUGCHECK_API_URL=https://api.rugcheck.xyz/v1

# Pump.fun WebSocket (if using direct integration)
PUMPFUN_WS_URL=wss://pumpfun-ws.example.com
```

### Database (Optional)

```bash
# PostgreSQL for tracking migrations and claims
DATABASE_URL=postgresql://localhost:5432/forkoor
```

### Twitter Bot (Optional)

```bash
# For automated announcements
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
```

### Frontend Configuration

For the Next.js frontend, create `apps/web/.env.local`:

```bash
# Public RPC URL (can be different from backend)
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
```

## Security Best Practices

1. **Never commit `.env` files** - They are in `.gitignore` by default
2. **Use separate wallets** for development and production
3. **Rotate keys regularly** if you suspect compromise
4. **Use environment secrets** in CI/CD pipelines
5. **Limit RPC access** to your application's IP addresses

## RPC Provider Recommendations

For production, use a dedicated RPC provider:

- [Helius](https://helius.xyz) - Recommended for Solana
- [QuickNode](https://quicknode.com)
- [Alchemy](https://alchemy.com)
- [Triton](https://triton.one)

Free tier RPC endpoints have rate limits that may cause issues during high activity.
