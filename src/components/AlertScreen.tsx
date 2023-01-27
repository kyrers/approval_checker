import styles from "../styles/Home.module.css"
import { Dispatch, SetStateAction } from "react";

type FunctionProps = {
    show: boolean;
    element: JSX.Element;
    setShow: Dispatch<SetStateAction<boolean>>;
};

export default function AlertScreen({ show, element, setShow }: FunctionProps) {
    return (
        show ?
            <div className={styles.alertScreen}>
                <div className={styles.alertContainer}>
                    {element}
                    <button onClick={() => setShow(false)}>Ok</button>
                </div>
            </div>
            :
            <></>

    );
};

export const installWalletElement = () => {
    return <div className={styles.alertText}>Please install the selected wallet to continue</div>;
};
