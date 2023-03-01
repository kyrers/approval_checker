import { ALL_APPROVAL_TOPICS, BIGNUMBER_ZER0 } from "@/utils/constants";
import { createDateFromTimestamp, formatBytes, getAddressUrl, getNetworkKey, getTransactionUrl, supportedChain } from "@/utils/shared";
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

export default function useApprovals(chainId: number, userAddress: any, userSigner: any, txList: any[] | undefined) {
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

    const { error: receiptsError } = useSWR({ url: `api/getTransactionReceiptByHash?chainId=${chainId}`, hashList: txList?.map(tx => tx.hash) }, receiptsFetcher, {
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
        const _userApprovalInfo: UserApprovalInfo[] = [];
        const abisToFetch: any[] = [];

        if (receipts) {
            let filteredReceipts = receipts.filter((response: any) => response.result.logs.length > 0).map((filteredResponses: any) => filteredResponses.result);
            filteredReceipts.forEach((receipt: any) => {
                receipt.logs.forEach((log: any) => {
                    //Get all events that correspond to approvals
                    if (ALL_APPROVAL_TOPICS.includes(log.topics[0])) {
                        const timestamp = txList?.find(tx => tx.hash === receipt.transactionHash).timestamp;
                        const date = createDateFromTimestamp(timestamp * 1000);
                        const existingObject = _userApprovalInfo.find(uai => uai.contractAddress === log.address);
                        if (existingObject) {
                            existingObject.logsEmitted.push({ timestamp: timestamp, date: date, txHash: receipt.transactionHash, data: log.data, topics: log.topics });
                        } else {
                            abisToFetch.push(log.address);
                            _userApprovalInfo.push({ contractName: log.address, contractAddress: log.address, contractABI: undefined, contractType: 0, contract: undefined, logsEmitted: [{ timestamp: timestamp, date: date, txHash: receipt.transactionHash, data: log.data, topics: log.topics, blockNumber: log.blockNumber }], decodedEvents: [] })
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
        const _userApprovalInfo = userApprovalInfo;
        const proxiedContracts: any[] = [];

        if (abis) {
            for (let abi of abis) {
                let existingObject = _userApprovalInfo.find(uai => uai.contractAddress === abi.address);

                if (existingObject) {
                    existingObject.contractABI = abi.data.result;
                    existingObject.contract = new Contract(existingObject.contractAddress, existingObject.contractABI, userSigner);
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
        }
    };

    /**
     * Ideally, this would be done using ERC165 supportsInterface. Unfortunately, most contracts don't support it.
     * This is a workaround. 
     */
    const determineContractType = async (uai: UserApprovalInfo) => {
        try {
            const contractFragments = uai.contract?.interface.fragments.map(f => f.name) ?? [];
            const type = contractFragments.includes("safeBatchTransferFrom") ? 3 : contractFragments.includes("setApprovalForAll") ? 2 : contractFragments.includes("approve") ? 1 : contractFragments.includes("implementation") ? -1 : 0;

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
            const decodedEvent = uai.contract?.interface.parseLog({ topics: log.topics, data: log.data });

            /**
             * Ignore Approval events where user is not the asset owner or where the zero address is the spender and the contract is an ERC721 or ERC1155.
             * This is because the zero address is often associated with mint/genesis events and we can ignore these for non ERC20 tokens
            */
            if (decodedEvent?.args[0] !== userAddress || decodedEvent?.args[1] === ethers.constants.AddressZero && uai.contractType !== 1) {
                continue;
            }

            const decimals = uai.contractType === 1 ? await uai.contract?.decimals() : undefined;
            const isCurrentApprovalForSpender = isCurrentApproval(uai.contractType === 1, decodedEvent?.args[2], formatBytes(decodedEvent?.args[1]), uai.decodedEvents);

            const eventObject = {
                timestamp: log.timestamp,
                date: log.date,
                txHash: formatBytes(log.txHash),
                txUrl: `${getTransactionUrl(chainId)}/${log.txHash}`,
                asset: uai.contractName,
                assetUrl: `${getAddressUrl(chainId)}/${uai.contractAddress}`,
                spender: formatBytes(decodedEvent?.args[1]),
                spenderUrl: `${getAddressUrl(chainId)}/${decodedEvent?.args[1]}`,
                amount: decimals ? decodedEvent?.args[2].eq(ethers.constants.MaxUint256) ? Number.parseFloat(ethers.utils.formatUnits(ethers.constants.MaxUint256, 18)) : Number.parseFloat(ethers.utils.formatUnits(decodedEvent?.args[2], decimals)) : "",
                isCurrentApprovalForSpender: isCurrentApprovalForSpender,
                revokeFunction: isCurrentApprovalForSpender ? determineRevokeFunction(uai.contractType === 1, uai.contract, decodedEvent?.args[1]) : undefined
            };


            uai.decodedEvents.push(eventObject);
        };
    }

    const isCurrentApproval = (isERC20: boolean, amount: any, spender: any, existingEvents: any[]) => {
        //If there is already an event flagged as the current user's approval for this spender, we keep it that way, otherwise this is the most recent approval
        const isMostRecentEventForSpender = existingEvents.find(de => de.spender === spender && de.isCurrentApprovalForSpender);
        if (isERC20) {
            //Unless it is an ERC20 and the amount is 0, in which case it is not considered a current approval and it will only be displayed in full history mode
            return amount.eq(BIGNUMBER_ZER0) || isMostRecentEventForSpender ? false : true
        }

        return isMostRecentEventForSpender ? false : true;
    }

    const determineRevokeFunction = (isERC20: boolean, contract: Contract | undefined, spender: any) => {
        if (contract) {
            return isERC20 ? () => contract.approve(spender, 0) : () => contract.setApprovalForAll(spender, false);
        }
        return undefined;
    }

    return {
        erc20Approvals: userApprovalInfo.filter(uai => uai.contractType === 1),
        erc721Approvals: userApprovalInfo.filter(uai => uai.contractType === 2),
        erc1155Approvals: userApprovalInfo.filter(uai => uai.contractType === 3),
        isDecoding,
        isError: receiptsError || abisError
    };
};
