import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ArrowDownUp } from "react-bootstrap-icons";
import styles from "../styles/EventsTable.module.css";

enum SortBy {
    Timestamp = "timestamp",
    Amount = "amount"
};

enum SortDirection {
    Asc = "asc",
    Desc = "desc"
};

export default function EventsTable({ events, type }: { events: any[], type: number }) {
    const [approvalData, setApprovalData] = useState(events);
    const [sortBy, setSortBy] = useState<SortBy>(SortBy.Timestamp);
    const [orderDirection, setOrderDirection] = useState<SortDirection>(SortDirection.Desc);
    const [showCurrentApprovals, setShowCurrentApprovals] = useState(true);

    useEffect(() => {
    }, [showCurrentApprovals]);

    useEffect(() => {
        if (orderDirection === SortDirection.Desc) {
            setApprovalData([...approvalData].sort((a, b) => b[sortBy] - a[sortBy]));
        } else {
            setApprovalData([...approvalData].sort((a, b) => a[sortBy] - b[sortBy]));
        }
    }, [sortBy, orderDirection])

    const handleSort = (sortKey: SortBy) => {
        if (sortBy === sortKey) {
            setOrderDirection(orderDirection === SortDirection.Desc ? SortDirection.Asc : SortDirection.Desc);
        } else {
            setSortBy(sortKey)
            setOrderDirection(SortDirection.Desc)
        }
    }

    const renderHeaders = () => {
        return (
            <tr key="header_row">
                <th>
                    <>
                        Date
                        <ArrowDownUp size={"20px"} onClick={() => handleSort(SortBy.Timestamp)} />
                    </>
                </th>
                <th>Transaction</th>
                <th>Asset</th>
                <th>Spender</th>
                {
                    type === 1 ?
                        <th>
                            <>
                                Amount
                                <ArrowDownUp size={"20px"} onClick={() => handleSort(SortBy.Amount)} />
                            </>
                        </th>
                        : null
                }
            </tr>
        );
    };

    const formatAmount = (amount: any) => {
        return amount === Number.parseFloat(ethers.utils.formatUnits(ethers.constants.MaxUint256, 18)) ? "Unlimited" : amount;
    }

    const renderRows = () => {
        return (
            approvalData.map((event: any, index: number) =>
                <tr key={`approval_row_${type}_${index}`}>
                    <td>{event.date}</td>
                    <td><a href={event.txUrl} target="_blank">{event.txHash}</a></td>
                    <td><a href={event.assetUrl} target="_blank">{event.asset}</a></td>
                    <td><a href={event.spenderUrl} target="_blank">{event.spender}</a></td>
                    {type === 1 ? <td>{formatAmount(event.amount)}</td> : null}
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