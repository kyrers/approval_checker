export const getLatestBlockApiUrl = (chainId: any) => {
    switch (chainId) {
        case "10":
            return `${process.env.NEXT_PUBLIC_OPTISCAN_GETH_LATEST_BLOCK_URL}`;
        default:
            return `${process.env.NEXT_PUBLIC_ETHERSCAN_GETH_LATEST_BLOCK_URL}`;
    };
};
