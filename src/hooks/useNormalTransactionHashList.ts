import useSWR from "swr";

export default function useNormalTransactionHashList(latestBlock: any, chainId: any, address: any) {
    const fetcher = (...args: [any]) => {
        if (undefined !== latestBlock && undefined !== chainId) {
            return fetch(...args).then((res) => res.json());
        }

        return undefined;
    };

    const { data, error, isLoading } = useSWR(`api/getNormalTransactionList?latestBlock=${latestBlock}&address=${address}&chainId=${chainId}`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    return { normalTxHashList: data ? formatResponse(data.result) : undefined, isLoading, isError: error };
};

export const formatResponse = (txArray: []) => {
    let hashArray: string[] = [];
    txArray.forEach((tx: any) => {
        hashArray.push(tx.hash)
    });

    return hashArray;
};
