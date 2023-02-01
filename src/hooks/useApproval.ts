import useSWR from "swr";

export default function useApprovals(chainId: any, txHashList: any[] | undefined) {
    const fetcher = (...args: [any]) => {
        if (txHashList && txHashList.length > 0) {
            //POST REQUEST TO SEND TX HASH LIST. OTHERWISE IT WOULD BE SENT VIA URL WHICH IS INSANE
            return fetch(args[0].url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args[0].hashList)
            }).then((res) => res.json());
        }

        return undefined;
    };

    const { data, error, isLoading } = useSWR({ url: `api/getTransactionReceiptByHash?chainId=${chainId}`, hashList: txHashList }, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    console.log("DATA", data)

    return { erc20Approvals: data, isLoading, isError: error };
};
