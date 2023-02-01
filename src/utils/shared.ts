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
