import { SUPPORTED_CHAINS } from "./constants";

export const supportedChain = (chainId: any) => {
    return SUPPORTED_CHAINS.includes(chainId);
};

export const formatBytes = (hash: string) => {
    return hash.substring(0, 6) + "..." + hash.slice(-4);
};

//URLS
export const getNetworkKey = (chainId: any) => {
    switch (chainId) {
        case "10":
            return process.env.NEXT_PUBLIC_OPTIMISM_ALCHEMY_KEY;
        default:
            return process.env.NEXT_PUBLIC_ALCHEMY_KEY;
    };
};

export const getChainAPIKey = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_KEY}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_KEY}`;
    };
};

export const getLatestBlockApiUrl = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_GETH_LATEST_BLOCK_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_GETH_LATEST_BLOCK_URL}`;
    };
};

export const getAccountNormalTransactionListApiUrl = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_ACCOUNT_NORMAL_TRANSACTIONS_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_ACCOUNT_NORMAL_TRANSACTIONS_URL}`;
    };
};

export const getTransactionReceiptByHashApiUrl = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_GETH_TRANSACTION_RECEIPT_BY_HASH}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_GETH_TRANSACTION_RECEIPT_BY_HASH}`;
    };
};

export const getContractABIApiUrl = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_GET_CONTRACT_ABI}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_GET_CONTRACT_ABI}`;
    };
};

export const getTransactionUrl = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_TRANSACTION_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_TRANSACTION_URL}`;
    };
};

export const getAddressUrl = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_SPENDER_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_SPENDER_URL}`;
    };
};
