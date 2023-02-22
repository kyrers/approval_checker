import { getLatestBlockApiUrl } from "@/utils/shared";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const url = getLatestBlockApiUrl(Number.parseInt(req.query.chainId?.toString() ?? "0"));
        const data = await fetch(url).then((response) => response.json());
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).send(err);
    }
};
