export default function EventsTable({ approvals, type }: { approvals: any[], type: number }) {
    console.log(approvals)
    return (
        <table className="table table-striped table-dark">
            <thead>
                <tr>
                    <th>Asset</th>
                    <th>Spender</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {
                    approvals.map(approval =>
                        approval.events.map((event: any) =>
                            <tr>
                                <td>{approval.asset}</td>
                                <td>{event.args[1]}</td>
                            </tr>
                        )
                    )
                }

            </tbody>
        </table>

    );
}