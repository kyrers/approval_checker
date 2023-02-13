import { ALL_APPROVAL_TOPICS, FALLBACK_INTERFACE } from "@/utils/constants";
import { getNetworkKey, supportedChain } from "@/utils/shared";
import { Contract, ethers } from "ethers";
import { useState } from "react";
import useSWR from "swr";

type UserApprovalInfo = {
    contractAddress: string;
    contractABI: any;
    contractType: number; //-1 proxy, 0 undefined, 1 ERC20, 2 ERC721, 3 ERC1155
    contract: Contract | undefined;
    logsEmitted: any[];
    decodedEvents: any[];
}

export default function useApprovals(chainId: any, txHashList: any[] | undefined) {
    const [isDecoding, setIsDecoding] = useState(true);
    const [contractAddressesToFetch, setContractAddressesToFetch] = useState<any[]>([]);
    // This bool is needed to control when to fetch ABIs, otherwise when any other state variable updated it would try to fetch again, since the abi fetcher useSWR uses state vars as a parameter
    const [isToFetchABIs, setIsToFetchABIs] = useState(false);
    const [userApprovalInfo, setUserApprovalInfo] = useState<UserApprovalInfo[]>([]);

    const receiptsFetcher = (...args: [any]) => {
        const hashList = args[0].hashList;
        if (hashList && hashList.length > 0 && supportedChain(chainId)) {
            setIsDecoding(true);
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

    const { error: receiptsError } = useSWR({ url: `api/getTransactionReceiptByHash?chainId=${chainId}`, hashList: txHashList }, receiptsFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const abisFetcher = (...args: [any]) => {
        const isToFetch = args[0].isToFetch;
        const contractAddresses = args[0].contractAddresses;
        if (isToFetch && contractAddresses && contractAddresses.length > 0 && supportedChain(chainId)) {
            setIsToFetchABIs(false);

            //POST request to send contractAddresses LIST. Otherwise it would be sent via url which is insane
            return fetch(args[0].url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contractAddresses)
            })
                .then((res) => res.json())
                .then((abis) => createContractInstancesAndDecodeEvents(abis));
        }

        return undefined;
    };

    const { error: abisError } = useSWR({ url: `api/getContractABI?chainId=${chainId}`, contractAddresses: contractAddressesToFetch, isToFetch: isToFetchABIs }, abisFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const fetchContractsABIFromReceipts = (receipts: any[]) => {
        let _userApprovalInfo = userApprovalInfo;
        let abisToFetch: any[] = [];

        if (receipts) {
            let filteredReceipts = receipts.filter((response: any) => response.result.logs.length > 0).map((filteredResponses: any) => filteredResponses.result);

            filteredReceipts.forEach((receipt: any) => {
                receipt.logs.forEach((log: any) => {
                    //Get all events that correspond to approvals
                    if (ALL_APPROVAL_TOPICS.includes(log.topics[0])) {
                        const existingObject = _userApprovalInfo.find(uai => uai.contractAddress === log.address);
                        if (existingObject) {
                            existingObject.logsEmitted.push({ data: log.data, topics: log.topics });
                        } else {
                            abisToFetch.push(log.address);
                            _userApprovalInfo.push({ contractAddress: log.address, contractABI: undefined, contractType: 0, contract: undefined, logsEmitted: [{ data: log.data, topics: log.topics }], decodedEvents: [] })
                        }
                    }
                })
            });
        }

        setUserApprovalInfo(_userApprovalInfo);
        setContractAddressesToFetch(abisToFetch);
        setIsToFetchABIs(true);
    };

    const createContractInstancesAndDecodeEvents = async (abis: any[]) => {
        let provider = new ethers.providers.AlchemyProvider(ethers.providers.getNetwork(chainId), getNetworkKey(chainId));
        let _userApprovalInfo = userApprovalInfo;
        let proxiedContracts: any[] = [];

        if (abis) {
            for (let abi of abis) {
                let existingObject = _userApprovalInfo.find(uai => uai.contractAddress === abi.address);

                if (existingObject) {
                    existingObject.contractABI = abi.data.result;
                    existingObject.contract = new Contract(existingObject.contractAddress, existingObject.contractABI, provider);
                    existingObject.contractType = await determineContractType(existingObject);
                    if (existingObject.contractType === -1) {
                        proxiedContracts.push(existingObject.contractAddress)
                    }
                    existingObject.logsEmitted.forEach((log: any) => {
                        /**
                        * Some contracts throwed an error when decoding the event because, somehow, their abi doesn't have the event emitted.
                        * To handle those situations, we have a FALLBACK_INTERFACE that has all the events we want to decode
                        */
                        try {
                            let decodedEvent = existingObject?.contract?.interface.parseLog({ topics: log.topics, data: log.data });
                            existingObject?.decodedEvents.push(decodedEvent)
                        } catch (_) {
                            let decodedEvent = FALLBACK_INTERFACE.parseLog({ topics: log.topics, data: log.data });
                            existingObject?.decodedEvents.push(decodedEvent);
                        }
                    });
                }
            };
        }

        if (proxiedContracts.length > 0) {
            //Fetch proxied contracts ABIs
            setContractAddressesToFetch(proxiedContracts);
            setIsToFetchABIs(true);
        } else {
            setUserApprovalInfo(_userApprovalInfo);
            console.log("STOPPED DECODING:", _userApprovalInfo)
            setIsDecoding(false);
        }
    };

    /**
     * Ideally, this would be done using ERC165 supportsInterface. Unfortunately, most contracts don't support it.
     * This is a workaround. 
     */
    const determineContractType = async (uai: UserApprovalInfo) => {
        try {
            let contractFragments = uai.contract?.interface.fragments.map(f => f.name) ?? [];
            //console.log("CONTRACT ", uai.contractAddress, contractFragments)
            let type = contractFragments.includes("safeBatchTransferFrom") ? 3 : contractFragments.includes("setApprovalForAll") ? 2 : contractFragments.includes("approve") ? 1 : contractFragments.includes("implementation") ? -1 : 0;

            if (-1 === type) {
                //Update the UserApprovalInfo object to the address of the implementation so we can refetch the ABI and get the implementation contract
                uai.contractAddress = await uai.contract?.implementation();
            }

            return type;
        } catch (err) {
            return 0;
        }
    }

    return { approvals: userApprovalInfo, isDecoding, isError: receiptsError || abisError};
};
