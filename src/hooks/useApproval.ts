import { ALL_APPROVAL_TOPICS } from "@/utils/constants";
import { getNetworkKey, supportedChain } from "@/utils/shared";
import { Contract, ethers } from "ethers";
import { useState } from "react";
import useSWR from "swr";

type UserApprovalInfo = {
    contractName: string;
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
                            _userApprovalInfo.push({ contractName: log.address, contractAddress: log.address, contractABI: undefined, contractType: 0, contract: undefined, logsEmitted: [{ data: log.data, topics: log.topics }], decodedEvents: [] })
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
                    } else {
                        existingObject.contractName = await existingObject.contract.name();
                    }
                    /**
                    * Proxy contracts throw an error when decoding the event because, their abi doesn't have the event emitted.
                    * To handle those situations, we only decode events for contracts that are not proxy contracts. 
                    * This works because later we will get the proxied contracts.
                    */
                    if (existingObject.contractType !== -1) {
                        await decodeEvents(existingObject);
                    }
                }
            };
        }

        if (proxiedContracts.length > 0) {
            //Fetch proxied contracts ABIs
            setContractAddressesToFetch(proxiedContracts);
            setIsToFetchABIs(true);
        } else {
            setUserApprovalInfo(_userApprovalInfo);
            setIsDecoding(false);
            console.log(_userApprovalInfo)
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

    const decodeEvents = async (uai: UserApprovalInfo) => {
        for (let log of uai.logsEmitted) {
            let decodedEvent = uai.contract?.interface.parseLog({ topics: log.topics, data: log.data });
            let decimals = uai.contractType === 1 ? await uai.contract?.decimals() : undefined;
            let eventObject = {
                asset: uai.contractName,
                spender: decodedEvent?.args[1],
                amount: decimals ? decodedEvent?.args[2].eq(ethers.constants.MaxUint256) ? "Unlimited" :Number.parseFloat(ethers.utils.formatUnits(decodedEvent?.args[2], decimals)) : ""
            }
            uai.decodedEvents.push(eventObject);
        };
    }

    return {
        erc20Approvals: userApprovalInfo.filter(uai => uai.contractType === 1),
        erc721Approvals: userApprovalInfo.filter(uai => uai.contractType === 2),
        erc1155Approvals: userApprovalInfo.filter(uai => uai.contractType === 3),
        isDecoding,
        isError: receiptsError || abisError
    };
};
