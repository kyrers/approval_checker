import { getAccountNormalTransactionListApiUrl, getChainAPIKey } from "@/utils/shared";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const correctAPIKey = getChainAPIKey(Number.parseInt(req.query.chainId?.toString() ?? "0"));
        const partialURL = getAccountNormalTransactionListApiUrl(Number.parseInt(req.query.chainId?.toString() ?? "0"));
        const fullURL = `${partialURL}&address=${req.query.address}&startblock=0&endblock=${req.query.latestBlock}&offset=10000&sort=desc&apikey=${correctAPIKey}`;
        const data = await fetch(fullURL).then((response) => response.json());
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).send(err);
    }
};
