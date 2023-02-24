import { SUPPORTED_CHAINS } from "./constants";

export const supportedChain = (chainId: number) => {
    return SUPPORTED_CHAINS.includes(chainId);
};

export const formatBytes = (hash: string) => {
    return hash.substring(0, 6) + "..." + hash.slice(-4);
};

export const createDateFromTimestamp = (timestamp: number) => {
    return new Date(timestamp).toUTCString().replace("GMT", "UTC");
}

//URLS
export const getNetworkKey = (chainId: number) => {
    switch (chainId) {
        case 10:
            return process.env.NEXT_PUBLIC_OPTIMISM_ALCHEMY_KEY;
        default:
            return process.env.NEXT_PUBLIC_ALCHEMY_KEY;
    };
};

export const getChainAPIKey = (chainId: number) => {
    switch (chainId) {
        case 10:
            return `${process.env.NEXT_PUBLIC_OPTISCAN_KEY}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_KEY}`;
    };
};

export const getLatestBlockApiUrl = (chainId: number) => {
    switch (chainId) {
        case 10:
            return `${process.env.NEXT_PUBLIC_OPTISCAN_GETH_LATEST_BLOCK_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_GETH_LATEST_BLOCK_URL}`;
    };
};

export const getAccountNormalTransactionListApiUrl = (chainId: number) => {
    switch (chainId) {
        case 10:
            return `${process.env.NEXT_PUBLIC_OPTISCAN_ACCOUNT_NORMAL_TRANSACTIONS_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_ACCOUNT_NORMAL_TRANSACTIONS_URL}`;
    };
};

export const getTransactionReceiptByHashApiUrl = (chainId: number) => {
    switch (chainId) {
        case 10:
            return `${process.env.NEXT_PUBLIC_OPTISCAN_GETH_TRANSACTION_RECEIPT_BY_HASH}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_GETH_TRANSACTION_RECEIPT_BY_HASH}`;
    };
};

export const getContractABIApiUrl = (chainId: number) => {
    switch (chainId) {
        case 10:
            return `${process.env.NEXT_PUBLIC_OPTISCAN_GET_CONTRACT_ABI}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_GET_CONTRACT_ABI}`;
    };
};

export const getTransactionUrl = (chainId: number) => {
    switch (chainId) {
        case 10:
            return `${process.env.NEXT_PUBLIC_OPTISCAN_TRANSACTION_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_TRANSACTION_URL}`;
    };
};

export const getAddressUrl = (chainId: number) => {
    switch (chainId) {
        case 10:
            return `${process.env.NEXT_PUBLIC_OPTISCAN_SPENDER_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_SPENDER_URL}`;
    };
};
