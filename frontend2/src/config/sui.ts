
// Configuration for Sui Network and Contracts

export const SUI_CONFIG = {
    NETWORK: 'testnet', // 'mainnet' | 'testnet' | 'devnet' | 'localnet'
    // These should be updated after deployment
    PACKAGE_ID: (import.meta as any).env.VITE_PACKAGE_ID || '0x0000000000000000000000000000000000000000000000000000000000000000',
    REGISTRY_ID: (import.meta as any).env.VITE_REGISTRY_ID || '0x0000000000000000000000000000000000000000000000000000000000000000',

    // Walrus Configuration
    WALRUS: {
        PUBLISHER_URL: 'https://publisher.walrus-testnet.walrus.space',
        AGGREGATOR_URL: 'https://aggregator.walrus-testnet.walrus.space',
    }
};

// Check if we are in mock mode (default if no env vars)
const isZeroAddress = (addr: string) => addr === '0x0000000000000000000000000000000000000000000000000000000000000000';
export const IS_MOCK_MODE = isZeroAddress(SUI_CONFIG.PACKAGE_ID) || !SUI_CONFIG.PACKAGE_ID || SUI_CONFIG.PACKAGE_ID === '';

