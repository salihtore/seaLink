# SeaLink 🌊�

**Decentralized LinkTree on Sui Network with Encrypted Messaging & NFT Integration**

> Built for the Walrus Hackathon 2025.

SeaLink is a next-generation decentralized social profile platform tailored for the **Sui ecosystem**. It leverages **Walrus** for decentralized storage and **Sui Move** smart contracts to give users full ownership of their data, links, and interactions.

![SeaLink Dashboard](./frontend2/public/sealink-banner.png) 
*(If you have a banner, place it here, otherwise this is a placeholder)*

## 🌟 Key Features

### 1. 🆔 On-Chain Identity
*   **Sui-Native Profiles:** Your profile is an NFT-like object on the Sui blockchain.
*   **Unstoppable:** No central server can ban you or delete your links.
*   **SuiNS Integration:** (Planned) Link your `.sui` names directly to your specialized SeaLink profile.

### 2. 🐘 Walrus Storage Integration
*   **Decentralized Hosting:** All profile metadata (bios, images, themes) and site assets are stored on **Walrus**, ensuring censorship resistance and high availability.
*   **Cross-Browser Sync:** Utilizes **Walrus Sites** technology to render profiles directly from decentralized storage, accessible across any browser via aggregators.
*   **Cost-Efficient:** Leverages Walrus's efficient blob storage for handling rich media (images, videos).

### 3. 🔐 Seal Encrypted Messaging
*   **Anonymous & Secure:** Send end-to-end encrypted messages to any SeaLink profile owner.
*   **Walrus Seal:** Uses Walrus Seal Blob Storage to store encrypted messages off-chain securely. Only the recipient's private key can decrypt the content.
*   **Censorship Resistant:** Messages endure as long as the Walrus storage guarantees, without central database oversight.

### 4. 🎨 NFT Gallery & Marketplace
*   **Showcase:** Display your Sui NFTs directly on your LinkTree profile.
*   **Trade:** (Beta) Basic marketplace features allowing users to list and trade NFTs directly from their profile interface.

---

## 🛠️ Architecture

*   **Frontend:** React 18, TypeScript, Vite
*   **Smart Contracts:** Sui Move
*   **Storage:** Walrus (Testnet)
*   **Integration:** `@mysten/dapp-kit`, `@mysten/sui`

### Project Structure
```
seaLink-7/
├── contracts/          # Sui Move Smart Contracts
├── frontend2/          # React Web Application
│   ├── src/
│   │   ├── components/ # Modular UI Components
│   │   ├── hooks/      # Custom React Hooks (useProfile, etc.)
│   │   ├── config/     # Sui & Walrus Configuration
│   │   └── utils/      # Walrus API & Encryption Utilities
├── walrus/             # Walrus Sites Configuration & Resources
└── README.md           # This file
```

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbnyfyjmg) (Browser Extension)
*   [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) (Optional, for contract deployment)

### 1. Installation

Clone the repository and install dependencies:

```bash
cd frontend2
npm install
```

### 2. Configuration

**Mock Mode (Default):**
The application runs in **Mock Mode** by default. This allows you to explore the UI, create profiles, and test messaging without needing to deploy contracts or spend gas.
*   **Active:** When `VITE_PACKAGE_ID` is missing or set to zero address in `src/config/sui.ts`.

**Real On-Chain Mode:**
To connect to the real Sui network (Testnet/Mainnet):
1.  Deploy the contracts in `contracts/` to Sui Testnet.
2.  Get the `Package ID` and `Registry ID` from the deployment output.
3.  Update `frontend2/src/config/sui.ts` OR create a `.env` file in `frontend2/`:

```env
VITE_PACKAGE_ID=0xYourPackageId...
VITE_REGISTRY_ID=0xYourRegistryId...
```

### 3. Running Locally

Start the development server:

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing Guide

How to verify the main integrations:

### Walrus Storage (Profile Creation)
1.  Connect your Sui Wallet.
2.  Go to the **"Create Profile"** tab.
3.  Fill in details and click **Create**.
4.  **Verify:** Open Console (F12). Look for logs indicating `📤 Uploading profile to Walrus...` and `✅ Profile saved locally with Walrus blob ID...`.

### Seal Messaging (Encryption)
1.  Go to **"Messages"** or **"Send Message"**.
2.  Select a recipient (e.g., "Alice (Demo)").
3.  Type a message, attach a file (optional), and check **"Anonymous"**.
4.  Click **Send**.
5.  **Verify:** Console logs should show `📤 Uploading encrypted message to Walrus Seal...`. If connected to the same account as the recipient (or in Mock Mode), you will see the message appear in the Inbox.

---

## 📄 License
MIT License. Open source and built for the community.
