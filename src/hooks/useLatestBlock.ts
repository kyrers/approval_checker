import { supportedChain } from "@/utils/shared";
import { BigNumber } from "ethers";
import useSWR from "swr";

export default function useLatestBlock(chainId: any) {
    const fetcher = (...args: [any]) => {
        if (supportedChain(chainId)) {
            return fetch(...args).then((res) => res.json());
        }

        return undefined;
    };
    const { data, error, isLoading } = useSWR(`api/getLatestBlock?chainId=${chainId}`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    return { latestBlock: data ? BigNumber.from(data?.result).toNumber() : undefined, isLoading, isError: error };
};
