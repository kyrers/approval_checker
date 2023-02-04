import { ALL_APPROVAL_TOPICS } from "@/utils/constants";
import { useEffect } from "react";
import useSWR from "swr";

export default function useApprovals(chainId: any, txHashList: any[] | undefined) {
    const fetcher = (...args: [any]) => {
        if (txHashList && txHashList.length > 0) {
            //POST REQUEST TO SEND TX HASH LIST. OTHERWISE IT WOULD BE SENT VIA URL WHICH IS INSANE
            return fetch(args[0].url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args[0].hashList)
            })
            .then((res) => res.json());
        }

        return undefined;
    };

    const { data, error, isLoading } = useSWR({ url: `api/getTransactionReceiptByHash?chainId=${chainId}`, hashList: txHashList }, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    useEffect(() => {
        if (data) {
            let filteredReceipts = data.filter((response: any) => response.result.logs.length > 0).map((filteredResponses: any) => filteredResponses.result);
            getContractsABI(filteredReceipts);
        }
    }, [data]);

    return { erc20Approvals: data, isLoading, isError: error };
};

export const getContractsABI = (receipts: any[]) => {
    let fetchedABIs : string[] = [];
    receipts.forEach((receipt: any) => {
        receipt.logs.forEach((log: any) => {
            //Only need to get ABI of contracts not fetched yet and with events that correspond to approvals
            if(!fetchedABIs.includes(log.address) && ALL_APPROVAL_TOPICS.includes(log.topics[0])) {
                fetchedABIs.push(log.address);
            }
        })
    });
}