import { getChainAPIKey, getTransactionByHashApiUrl } from "@/utils/shared";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const correctAPIKey = getChainAPIKey(req.query.chainId);
        const partialURL = getTransactionByHashApiUrl(req.query.chainId);

        const response: any[] = [];
        const hashList = req.body;
        const length = hashList?.length ?? 0;
        for (let i = 0; i < length; i++) {
            const fullURL = `${partialURL}&txhash=${hashList![i]}&apikey=${correctAPIKey}`;
            console.log("HERE", fullURL)

            const data = await fetch(fullURL).then((response) => response.json());
            console.log("DATA", data)
            response.push(data);
        }

        return res.status(200).json(response);
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
};
