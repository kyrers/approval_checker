import { ALL_APPROVAL_TOPICS } from "@/utils/constants";
import { getNetworkKey } from "@/utils/shared";
import { Contract, ethers } from "ethers";
import { useState } from "react";
import useSWR from "swr";

type UserApprovalInfo = {
    contractAddress: string;
    contractABI: any;
    contract: Contract | undefined;
    logsEmitted: any[];
}

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
                .then((abis) => createContractInstances(abis));
        }

        return undefined;
    };

    //const [addressToLogsMap, setAddressToLogsMap] = useState<Map<string, any[]>>(new Map());
    const [userApprovalInfo, setUserApprovalInfo] = useState<UserApprovalInfo[]>([]);

    const { data: abis, error: abisError, isLoading: isLoadingABIs } = useSWR({ url: `api/getContractABI?chainId=${chainId}`, contractAddresses: userApprovalInfo.map(uai => uai.contractAddress) }, abisFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const fetchContractsABIFromReceipts = async (receipts: any[]) => {
        let _userApprovalInfo: UserApprovalInfo[] = [];

        if (receipts) {
            let filteredReceipts = receipts.filter((response: any) => response.result.logs.length > 0).map((filteredResponses: any) => filteredResponses.result);
            filteredReceipts.forEach((receipt: any) => {
                receipt.logs.forEach((log: any) => {
                    //Get all events that correspond to approvals
                    if (ALL_APPROVAL_TOPICS.includes(log.topics[0])) {
                        const existingObject = _userApprovalInfo.find(uai => uai.contractAddress === log.address);
                        if (existingObject) {
                            existingObject.logsEmitted.push(log.topics);
                        } else {
                            _userApprovalInfo.push({ contractAddress: log.address, contractABI: undefined, contract: undefined, logsEmitted: [log.topics] })
                        }
                    }
                })
            });
        }

        setUserApprovalInfo(_userApprovalInfo);
    };

    const createContractInstances = async (abis: any[]) => {
        let provider = new ethers.providers.AlchemyProvider(ethers.providers.getNetwork(chainId), getNetworkKey(chainId));
        let _userApprovalInfo = userApprovalInfo;

        if (abis) {
            abis.forEach((abi: any) => {
                let existingObject = _userApprovalInfo.find((uai) => uai.contractAddress === abi.address);
                if (existingObject) {
                    existingObject.contractABI = abi.data.result;
                    existingObject.contract = new Contract(existingObject.contractAddress, existingObject.contractABI, provider);
                }
            });
        }

        setUserApprovalInfo(_userApprovalInfo);
    };

    return { erc20Approvals: receipts, isLoadingReceipts, isError: receiptsError };
};
