import styles from "../styles/MainPanel.module.css";
import { Tab, Tabs } from "react-bootstrap";
import { useAccount, useNetwork } from "wagmi";
import { connectWalletText, errorText } from "@/utils/strings";
import { supportedChain } from "@/utils/shared";
import useLatestBlock from "@/hooks/useLatestBlock";
import useNormalTransactionHashList from "@/hooks/useNormalTransactionHashList";
import useApprovals from "@/hooks/useApproval";
import LoadingScreen from "./LoadingScreen";
import EventsTable from "./EventsTable";

export default function MainPanel() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { latestBlock, isLoading: isLoadingLatestBlock, isError: isErrorLoadingLatestBlock } = useLatestBlock(chain?.id);
    const { normalTxHashList, isLoading: isLoadingTransactions, isError: isErrorLoadingTransactions } = useNormalTransactionHashList(latestBlock, chain?.id, address);
    const { erc20Approvals, erc721Approvals, erc1155Approvals, isDecoding, isError: isErrorLoadingApprovals } = useApprovals(chain?.id, normalTxHashList);

    return (
        <div className={styles.mainPanel}>
            {
                !isConnected || !supportedChain(chain?.id) ?
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
