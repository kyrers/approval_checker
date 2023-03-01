import { supportedChain } from "@/utils/shared";
import useSWR from "swr";

export default function useNormalTransactionHashList(latestBlock: any, chainId: number, address: any) {
    const fetcher = (...args: [any]) => {
        if (undefined !== latestBlock && supportedChain(chainId)) {
            return fetch(...args).then((res) => res.json());
        }

        return undefined;
    };

    const { data, error, isLoading } = useSWR(`api/getNormalTransactionList?latestBlock=${latestBlock}&address=${address}&chainId=${chainId}`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    return { normalTxList: data ? formatResponse(data.result) : undefined, isLoading, isError: error };
};

export const formatResponse = (txArray: []) => {
    let hashArray: any[] = [];
    txArray.forEach((tx: any) => {
        hashArray.push({ timestamp: tx.timeStamp, hash: tx.hash })
    });

    return hashArray;
};
