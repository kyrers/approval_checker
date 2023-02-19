import styles from "../styles/EventsTable.module.css";

export default function EventsTable({ events, type }: { events: any[], type: number }) {
    console.log(events)

    const renderHeaders = () => {
        return (
            <tr key="header_row">
                <th>Transaction</th>
                <th>Asset</th>
                <th>Spender</th>
                {type === 1 ? <th>Amount</th> : null}
            </tr>
        );
    };

    const renderRows = () => {
        return (
            events.map((event: any, index: number) =>
                <tr key={`approval_row_${type}_${index}`}>
                    <td><a href={event.txUrl} target="_blank">{event.txHash}</a></td>
                    <td>{event.asset}</td>
                    <td>{event.spender}</td>
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