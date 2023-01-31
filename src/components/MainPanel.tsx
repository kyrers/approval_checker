import styles from "../styles/MainPanel.module.css";
import { Tab, Tabs } from "react-bootstrap";

export default function MainPanel() {
    return (
        <Tabs defaultActiveKey="ERC20" id="approval-category-tab" className={styles.mainPanel}>
            <Tab eventKey="ERC20" title="ERC20">
                ERC20 Table
            </Tab>
            <Tab eventKey="ERC721" title="ERC721">
                ERC721 Table
            </Tab>
            <Tab eventKey="ERC1155" title="ERC1155">
                ERC1155 Table
            </Tab>
        </Tabs>
    );
}