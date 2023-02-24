import { useEffect, useState } from "react";
import styles from "../styles/EventsTable.module.css";

export default function EventsTable({ events, type }: { events: any[], type: number }) {
    const [approvalData, setApprovalData] = useState(events);
    const [showMostRecent, setShowMostRecent] = useState(true);
    const [showCurrentApprovals, setShowCurrentApprovals] = useState(true);

    useEffect(() => {
    }, [showMostRecent]);

    useEffect(() => {
    }, [showCurrentApprovals]);

    const renderHeaders = () => {
        return (
            <tr key="header_row">
                <th>Date</th>
                <th>Transaction</th>
                <th>Asset</th>
                <th>Spender</th>
                {type === 1 ? <th>Amount</th> : null}
            </tr>
        );
    };

    const renderRows = () => {
        return (
            approvalData.map((event: any, index: number) =>
                <tr key={`approval_row_${type}_${index}`}>
                    <td>{event.date}</td>
                    <td><a href={event.txUrl} target="_blank">{event.txHash}</a></td>
                    <td><a href={event.assetUrl} target="_blank">{event.asset}</a></td>
                    <td><a href={event.spenderUrl} target="_blank">{event.spender}</a></td>
                    {type === 1 ? <td>{event.amount}</td> : null}
                </tr>
            )
        );
    };

    return (
        <table className={`${styles.eventsTable} table table-striped table-dark`}>
            <thead>
                {renderHeaders()}
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    );
}