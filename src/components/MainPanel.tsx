import styles from "../styles/MainPanel.module.css";
import { Tab, Tabs } from "react-bootstrap";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { connectWalletText, errorText } from "@/utils/strings";
import { supportedChain } from "@/utils/shared";
import useLatestBlock from "@/hooks/useLatestBlock";
import useNormalTransactionHashList from "@/hooks/useNormalTransactionHashList";
import useApprovals from "@/hooks/useApproval";
import LoadingScreen from "./LoadingScreen";
import EventsTable from "./EventsTable";

type FunctionProps = {
    displayAlert: (element: JSX.Element) => void;
};

export default function MainPanel({ displayAlert }: FunctionProps) {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();
    const { latestBlock, isLoading: isLoadingLatestBlock, isError: isErrorLoadingLatestBlock } = useLatestBlock(chain?.id ?? 0);
    const { normalTxList, isLoading: isLoadingTransactions, isError: isErrorLoadingTransactions } = useNormalTransactionHashList(latestBlock, chain?.id ?? 0, address);
    const { erc20Approvals, erc721Approvals, erc1155Approvals, isDecoding, isError: isErrorLoadingApprovals } = useApprovals(chain?.id ?? 0, address, signer, normalTxList, displayAlert);

    return (
        <div className={styles.mainPanel}>
            {
                !isConnected || !supportedChain(chain?.id ?? 0) ?
                    <h3>{connectWalletText}</h3>
                    :
                    isErrorLoadingLatestBlock || isErrorLoadingTransactions || isErrorLoadingApprovals ?
                        <h2>{errorText}</h2>
                        :
                        isLoadingLatestBlock || isLoadingTransactions || isDecoding ?
                            <LoadingScreen />
                            :
                            <Tabs defaultActiveKey="ERC20" id="approval-category-tab">
                                <Tab eventKey="ERC20" title="ERC20">
                                    <EventsTable events={erc20Approvals.flatMap(approval => approval.decodedEvents)} type={1} />
                                </Tab>
                                <Tab eventKey="ERC721" title="ERC721">
                                    <EventsTable events={erc721Approvals.flatMap(approval => approval.decodedEvents)} type={2} />
                                </Tab>
                                <Tab eventKey="ERC1155" title="ERC1155">
                                    <EventsTable events={erc1155Approvals.flatMap(approval => approval.decodedEvents)} type={3} />
                                </Tab>
                            </Tabs>
            }
        </div>
    );
}
