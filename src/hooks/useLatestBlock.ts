import { BigNumber } from "ethers";
import useSWR from "swr";

type Data = {
    jsonrpc: string;
    id: string;
    result: string;
};

export default function useLatestBlock(chainId: any) {
    const fetcher = (...args: [any]) => fetch(...args).then((res) => res.json());
    const { data, error, isLoading } = useSWR<Data>(`api/getLatestBlock?chainId=${chainId}`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    return { latestBlock: data ? BigNumber.from(data?.result).toNumber() : undefined, isLoading, isError: error };
};
