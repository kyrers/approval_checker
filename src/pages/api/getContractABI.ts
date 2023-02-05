import { getChainAPIKey, getContractABIApiUrl } from "@/utils/shared";
import { NextApiRequest, NextApiResponse } from "next";
import { setTimeout } from "timers/promises";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const correctAPIKey = getChainAPIKey(req.query.chainId);
        const partialURL = getContractABIApiUrl(req.query.chainId);

        const response: any[] = [];
        const addressesList = req.body;
        const length = addressesList?.length ?? 0;

        const fetch5 = (batch: any[]) => {
            return Promise.all(
                batch.map(async (address) => {
                    const fullURL = `${partialURL}&address=${address}&apikey=${correctAPIKey}`;
                    const data = await fetch(fullURL).then((response) => response.json());
                    response.push(data);
                })
            );
        }

        /*
        * Etherscan api has a 5 request/second rate limit.
        * Wait 1 second before starting requests in batchs of 5/sec for any previous unrelated request
        */
        await setTimeout(1000);
        for (let i = 0; i < length; i = i + 5) {
            await fetch5(addressesList.slice(i, i + 5));

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
