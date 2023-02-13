import { loadingText } from "@/utils/strings";
import { Spinner } from "react-bootstrap";

export default function LoadingScreen() {
    return (
        <>
            <Spinner />
            <p>{loadingText}</p>
        </>
    );
};
