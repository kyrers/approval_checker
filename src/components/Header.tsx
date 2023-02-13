import styles from "../styles/Header.module.css"
import { Dispatch, SetStateAction } from "react";
import { useAccount } from "wagmi";
import { appTitle, supportedChainsText } from "@/utils/strings";

type FunctionProps = {
    setShowWalletSelector: Dispatch<SetStateAction<boolean>>;
};

export default function Header({ setShowWalletSelector }: FunctionProps) {
    const { address, isConnected } = useAccount();

    const formatAddress = (address: any) => {
        return address.substring(0, 6) + "..." + address.slice(-4);
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerInfo}>
                <h1 className={styles.headerText}>{appTitle}</h1>
                <p>{supportedChainsText}</p>
            </div>
            <div className={styles.headerWallet}>
                <button onClick={() => setShowWalletSelector(true)}>
                    {
                        isConnected ?
                            <span title={address}>{formatAddress(address)}</span>
                            :
                            <span>Connect wallet</span>
                    }
                </button>
            </div>
        </header>
    );
};
