import useSWR from "swr";

type Data = {
    jsonrpc: string;
    id: string;
    result: string;
}

export default function useLatestBlock() {
    const fetcher = (...args: [any]) => fetch(...args).then((res) => res.json());
    const { data, error, isLoading } = useSWR<Data>("api/getLatestBlock", fetcher);

    return { latestBlock: data?.result, isLoading, isError: error };
};
