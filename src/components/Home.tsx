import styles from "../styles/Home.module.css";
import { useState } from "react";
import WalletSelector from "./WalletSelector";
import Header from "./Header";
import useLatestBlock from "@/hooks/useLatestBlock";

export default function Home() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertElement, setAlertElement] = useState<JSX.Element>(<></>);
    const [showWalletSelector, setShowWalletSelector] = useState(false);
    const { latestBlock, isLoading, isError } = useLatestBlock();


    const displayAlert = (element: JSX.Element) => {
        setAlertElement(element);
        setShowAlert(true);
    };

    return (
        <div className={styles.home}>
            {showWalletSelector ? <WalletSelector setShowWalletSelector={setShowWalletSelector} displayAlert={displayAlert} /> : null}
            <Header setShowWalletSelector={setShowWalletSelector} />
            {isLoading ?
                <p>Loading</p>
                :
                isError ?
                    <p>Error</p>
                    :
                    <p>{latestBlock!}</p>
            }
            {/*<MainPanel displayAlert={displayAlert} />
          <AlertScreen show={showAlert} element={alertElement} setShow={setShowAlert} />
    <Footer />*/}
        </div>
    );
}