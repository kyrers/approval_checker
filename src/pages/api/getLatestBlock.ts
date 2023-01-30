import { getLatestBlockApiUrl } from "@/utils/shared";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const url = getLatestBlockApiUrl(req.query.chainId);
        const data = await fetch(url).then((response) => response.json());
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).send(err);
    }
};
