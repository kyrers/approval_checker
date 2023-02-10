import { ALL_APPROVAL_TOPICS, ERC1155_INTERFACE_ID, ERC20_INTERFACE_ID, ERC721_INTERFACE_ID, FALLBACK_INTERFACE } from "@/utils/constants";
import { getNetworkKey } from "@/utils/shared";
import { Contract, ethers } from "ethers";
import { useState } from "react";
import useSWR from "swr";

type UserApprovalInfo = {
    contractAddress: string;
    contractABI: any;
    contractType: number; //0 undefined, 1 ERC20, 2 ERC721, 3 ERC1155
    contract: Contract | undefined;
    logsEmitted: any[];
    decodedEvents: any[];
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
        const isToFetch = args[0].isToFetch;
        const contractAddresses = args[0].contractAddresses;
        if (isToFetch && contractAddresses && contractAddresses.length > 0) {
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

    const [contractAddressesToFetch, setContractAddressesToFetch] = useState<any[]>([]);
    // This bool is needed to control when to fetch ABIs, otherwise when any other state variable updated it would try to fetch again, since the abi fetcher useSWR uses state vars as a parameter
    const [isToFetchABIs, setIsToFetchABIs] = useState(false);
    const [userApprovalInfo, setUserApprovalInfo] = useState<UserApprovalInfo[] | undefined>([]);

    const { data: abis, error: abisError, isLoading: isLoadingABIs } = useSWR({ url: `api/getContractABI?chainId=${chainId}`, contractAddresses: contractAddressesToFetch, isToFetch: isToFetchABIs }, abisFetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const fetchContractsABIFromReceipts = (receipts: any[]) => {
        let _userApprovalInfo: UserApprovalInfo[] = [];
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

    const createContractInstancesAndDecodeEvents = (abis: any[]) => {
        let provider = new ethers.providers.AlchemyProvider(ethers.providers.getNetwork(chainId), getNetworkKey(chainId));
        let _userApprovalInfo = userApprovalInfo;

        if (abis) {
            abis.forEach(async (abi: any) => {
                let existingObject = _userApprovalInfo?.find(uai => uai.contractAddress === abi.address);

                if (existingObject) {
                    existingObject.contractABI = abi.data.result;
                    existingObject.contract = new Contract(existingObject.contractAddress, existingObject.contractABI, provider);
                    let type = await determineContractType(existingObject.contract);
                    console.log("TYPE: ", type)
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
            });
        }

        console.log("FINALIZED: ", _userApprovalInfo)
        setUserApprovalInfo(_userApprovalInfo);
    };

    const determineContractType = async (contract: Contract) => {
        console.log("CHECKING CONTRACT: ", contract.address)
        try {
            const isERC20 = await contract.functions.supportsInterface(ERC20_INTERFACE_ID);
            console.log("IS ERC 20?", isERC20);
            if (isERC20) {
                return 1;
            }

            console.log("HERE 1")
            const isERC721 = await contract.functions.supportsInterface(ERC721_INTERFACE_ID);
            console.log("IS ERC 721?", isERC721)
            if (isERC721) {
                return 2;
            }

            console.log("HERE 2")

            const isERC1155 = await contract.functions.supportsInterface(ERC1155_INTERFACE_ID);
            console.log("IS ERC 1155?", isERC1155);
            if (isERC1155) {
                return 3;
            }

            return 0;
        } catch (_) {
            console.log("HERE 3")
            return 0;
        }
    }

    return { erc20Approvals: receipts, isLoadingReceipts, isError: receiptsError };
};
