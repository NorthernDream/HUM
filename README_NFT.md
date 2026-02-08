# Voice NFT on 0G Testnet

This project allows minting Voice IDs as NFTs on the 0G Galileo Testnet. It provides a complete system for tokenizing voice data, managing ownership, and restoring voice parameters from the blockchain.

## Features

*   **Mint Voice NFT**: Tokenize your unique Voice ID and Embedding Hash on the 0G blockchain.
*   **Manage & Restore**: Retrieve voice data (Voice ID and Embedding Hash) directly from the blockchain using the Token ID.
*   **Transfer Ownership**: Securely transfer your Voice NFT to another user using standard ERC-721 transfer mechanisms.

## Prerequisites

1.  **Node.js**: Installed.
2.  **MetaMask**: Installed in your browser.
3.  **0G Testnet Tokens**: You need tokens to deploy and mint. Get them from the [0G Faucet](https://faucet.0g.ai/).

## Deployment (One-time setup)

To enable minting, you need to deploy the Smart Contract first.

**Note**: A contract has already been deployed for testing purposes.
*   **Contract Address**: `0xb11F619C9D13193C31AcFb5b4FA19e72DB3958d5`
*   **Network**: 0G Galileo Testnet (Chain ID 16602)

If you wish to deploy your own contract:

1.  Create a `.env` file in `blockchain` folder with your private key:
    ```
    PRIVATE_KEY=your_private_key_here
    ```
2.  Install dependencies in `blockchain` folder:
    ```bash
    cd blockchain
    npm install
    ```
3.  Deploy the contract:
    ```bash
    npx hardhat run scripts/deploy.js --network 0g-galileo
    ```
4.  Copy the deployed contract address from the output.
5.  Open `frontend/src/config/web3.ts` and replace `VOICE_NFT_ADDRESS` with your new contract address.

## Usage

1.  Start the frontend:
    ```bash
    cd frontend
    npm run dev
    ```

### Minting a Voice
1.  Go to "My Voices" (or create a new voice first).
2.  Click on a voice to see details.
3.  In the "Mint Voice NFT" section, click "Mint NFT".
4.  Confirm the transaction in MetaMask.
5.  Once minted, note down the **Token ID**.

### Managing & Restoring
1.  On the Voice Detail page, switch to the **"Manage & Restore"** tab in the NFT card.
2.  **Restore Voice**: Enter a Token ID and click "Fetch Voice Data". This verifies the voice data stored on-chain.
3.  **Transfer Ownership**:
    *   First, fetch the voice data to confirm it's the correct token.
    *   Enter the recipient's wallet address (starts with `0x`).
    *   Click "Transfer NFT" to send the voice ownership to another user.

## Network Info

-   **Network Name**: 0G Galileo Testnet
-   **RPC URL**: `https://evmrpc-testnet.0g.ai`
-   **Chain ID**: `16602` (0x40DA)
-   **Currency**: A0GI (Testnet Token)
-   **Explorer**: [0G ChainScan](https://chainscan-galileo.0g.ai)
