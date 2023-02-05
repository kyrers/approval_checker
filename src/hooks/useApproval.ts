import { ALL_APPROVAL_TOPICS } from "@/utils/constants";
import { useState } from "react";
import useSWR from "swr";

export default function useApprovals(chainId: any, txHashList: any[] | undefined) {
    const receiptsFetcher = (...args: [any]) => {
        const hashList = args[0].hashList;
        if (hashList && hashList.length > 0) {
            //POST REQUEST TO SEND TX HASH LIST. OTHERWISE IT WOULD BE SENT VIA URL WHICH IS INSANE
            return fetch(args[0].url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(hashList)
            })
                .then((res) => res.json())
                .then((receipts) => fetchContractsABIFromReceipts(receipts));
        }

        return undefined;
    };

    const { data: receipts, error: receiptsError, isLoading: isLoadingReceipts } = useSWR({ url: `api/getTransactionReceiptByHash?chainId=${chainId}`, hashList: txHashList }, receiptsFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const abisFetcher = (...args: [any]) => {
        const contractAddresses = args[0].contractAddresses;
        if (contractAddresses.length > 0) {
            //POST REQUEST TO SEND contractAddresses LIST. OTHERWISE IT WOULD BE SENT VIA URL WHICH IS INSANE
            return fetch(args[0].url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contractAddresses)
            })
                .then((res) => res.json())
                .then((abis) => console.log(abis));
        }

        return undefined;
    };

    const [contractAddresses, setContractAddresses] = useState<string[]>([]);
    const { data: abis, error: abisError, isLoading: isLoadingABIs } = useSWR({ url: `api/getContractABI?chainId=${chainId}`, contractAddresses: contractAddresses }, abisFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const fetchContractsABIFromReceipts = async (receipts: any[]) => {
        let abisToFetch: string[] = [];
        if (receipts) {
            let filteredReceipts = receipts.filter((response: any) => response.result.logs.length > 0).map((filteredResponses: any) => filteredResponses.result);
            filteredReceipts.forEach((receipt: any) => {
                receipt.logs.forEach((log: any) => {
                    //Only need to get ABI of contracts not fetched yet and with events that correspond to approvals
                    if (!abisToFetch.includes(log.address) && ALL_APPROVAL_TOPICS.includes(log.topics[0])) {
                        abisToFetch.push(log.address);
                    }
                })
            });
        }

        setContractAddresses(abisToFetch);
    };

    return { erc20Approvals: receipts, isLoadingReceipts, isError: receiptsError };
};
