import styles from "../styles/Home.module.css";
import { Dispatch, SetStateAction } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { installWalletElement } from "./AlertScreen";

type FunctionProps = {
    setShowWalletSelector: Dispatch<SetStateAction<boolean>>;
    displayAlert: (element: JSX.Element) => void;
};

export default function WalletSelector({ setShowWalletSelector, displayAlert }: FunctionProps) {
    const { isConnected } = useAccount();
    const { connectAsync, connectors } = useConnect({
        onError(error) {
            if (error.name === "ConnectorNotFoundError") {
                displayAlert(installWalletElement());
            }
        }
    });
    const { disconnect } = useDisconnect();

    const onConnect = async (connector: any) => {
        await connectAsync({ connector });
    };

    const onDisconnect = async () => {
        disconnect();
    }

    if (isConnected) {
        return (
            <div className={styles.walletSelector} onClick={() => setShowWalletSelector(false)}>
                <div >
                    <h1 className={styles.centeredText && styles.headerText}>Disconnect Wallet?</h1>
                    <button type="button" key="disconnect_wallet" onClick={() => onDisconnect()}>
                        Disconnect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.walletSelector} onClick={() => setShowWalletSelector(false)}>
            <div >
                <h1 className={styles.centeredText && styles.headerText}>Choose Wallet</h1>
                {
                    connectors.map((connector: any) => {
                        return (
                            <button type="button" key={connector.id} onClick={() => onConnect(connector)}>
                                {connector.name}
                            </button>
                        );
                    })
                }
            </div>
        </div>
    );
}
