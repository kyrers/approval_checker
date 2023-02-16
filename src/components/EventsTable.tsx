export default function EventsTable({ events, type }: { events: any[], type: number }) {
    console.log(events)

    const renderHeaders = () => {
        return (
            <tr key="header_row">
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
                    <td>{event.asset}</td>
                    <td>{event.spender}</td>
                    {type === 1 ? <td>{event.amount}</td> : null}
                </tr>
            )
        );
    };

    return (
        <table className="table table-striped table-dark">
            <thead>
                {renderHeaders()}
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>

    );
}