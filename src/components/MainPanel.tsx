import { Tab, Tabs } from "react-bootstrap";

export default function MainPanel() {
    return (
        <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="mb-3">
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