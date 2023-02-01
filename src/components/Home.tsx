import styles from "../styles/Home.module.css";
import { useState } from "react";
import WalletSelector from "./WalletSelector";
import Header from "./Header";
import MainPanel from "./MainPanel";

export default function Home() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertElement, setAlertElement] = useState<JSX.Element>(<></>);
    const [showWalletSelector, setShowWalletSelector] = useState(false);

    const displayAlert = (element: JSX.Element) => {
        setAlertElement(element);
        setShowAlert(true);
    };

    return (
        <div className={styles.home}>
            {showWalletSelector ? <WalletSelector setShowWalletSelector={setShowWalletSelector} displayAlert={displayAlert} /> : null}
            <Header setShowWalletSelector={setShowWalletSelector} />
            <MainPanel />
            {/*<MainPanel displayAlert={displayAlert} />
          <AlertScreen show={showAlert} element={alertElement} setShow={setShowAlert} />
    <Footer />*/}
        </div>
    );
}