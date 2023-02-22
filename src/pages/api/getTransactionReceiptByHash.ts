import { getChainAPIKey, getTransactionReceiptByHashApiUrl } from "@/utils/shared";
import { NextApiRequest, NextApiResponse } from "next";
import { setTimeout } from "timers/promises";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const correctAPIKey = getChainAPIKey(Number.parseInt(req.query.chainId?.toString() ?? "0"));
        const partialURL = getTransactionReceiptByHashApiUrl(Number.parseInt(req.query.chainId?.toString() ?? "0"));

        const hashList = req.body;
        const length = hashList?.length ?? 0;

        /**
         * Create an array for the receipts with the same length as the number of tx hashes.
         * This is needed so later we can have the receipts in the same order as the Etherscan API returned the transactions in getNormalTransactions.
         * Note that this actually populates the array with the hashes, but we need to do so because we can't simple keep a record of the index 
         * of the hash being fetched and then replace the response array in the same position. We can't do this because we use the fetch5 function array and
         * slice the hashList in batches of 5, so indexes would always be 1...5
         */
        const response: any[] = [...hashList];

        const fetch5 = (batch: any[]) => {
            return Promise.all(
                batch.map(async (txHash) => {
                    const fullURL = `${partialURL}&txhash=${txHash}&apikey=${correctAPIKey}`;
                    const data = await fetch(fullURL).then((response) => response.json());
                    const index = response.findIndex(txHash => txHash === data.result.transactionHash);
                    //Use splice to simulate an insertAt operation,removing the txHash and adding the receipt
                    response.splice(index, 1, data);
                })
            );
        }

        /*
        * Etherscan api has a 5 request/second rate limit.
        * Wait 1 second before starting requests in batchs of 5/sec for any previous unrelated request
        */
        await setTimeout(1000);
        for (let i = 0; i < length; i = i + 5) {
            await fetch5(hashList.slice(i, i + 5));

            /*
            * Using performance.now to determine how long the batch took resulted in a ~5s speed improvement.
            * However, doing so would sometimes result in random fetches failing, perhaps because of differet ms values in the Etherscan API.
            * These failed fetches would need to be retried. Considering that this is not a query that needs to be repeated often,
            * I opted to just wait 1sec after each batch to make sure none fails, since the ~5s improvement would be offset by the retries. 
            */
            await setTimeout(1000);
        }

        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).send(err);
    }
};
