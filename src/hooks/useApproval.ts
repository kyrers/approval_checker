import { ALL_APPROVAL_TOPICS } from "@/utils/constants";
import { useState } from "react";
import useSWR from "swr";

export default function useApprovals(chainId: any, txHashList: any[] | undefined) {
    const receiptsFetcher = (...args: [any]) => {
        const hashList = args[0].hashList;
        if (hashList && hashList.length > 0) {
            //POST request to send hashList. Otherwise it would be sent via url which is insane
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
            //POST request to send contractAddresses LIST. Otherwise it would be sent via url which is insane
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

    const [addressToLogsMap, setAddressToLogsMap] = useState<Map<string, any[]>>(new Map());
    const { data: abis, error: abisError, isLoading: isLoadingABIs } = useSWR({ url: `api/getContractABI?chainId=${chainId}`, contractAddresses: Array.from(addressToLogsMap.keys()) }, abisFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const fetchContractsABIFromReceipts = async (receipts: any[]) => {
        //Map to hold the contract address and the total of logs it emitted
        let _addressToLogsMap = new Map<string, any[]>();

        if (receipts) {
            let filteredReceipts = receipts.filter((response: any) => response.result.logs.length > 0).map((filteredResponses: any) => filteredResponses.result);
            filteredReceipts.forEach((receipt: any) => {
                receipt.logs.forEach((log: any) => {
                    //Get all events that correspond to approvals
                    if (ALL_APPROVAL_TOPICS.includes(log.topics[0])) {
                        if (_addressToLogsMap.get(log.address)) {
                            _addressToLogsMap.get(log.address)!.push(log.topics);
                        } else {
                            _addressToLogsMap.set(log.address, [log.topics]);
                        }
                    }
                })
            });
        }

        setAddressToLogsMap(_addressToLogsMap);
    };

    return { erc20Approvals: receipts, isLoadingReceipts, isError: receiptsError };
};
