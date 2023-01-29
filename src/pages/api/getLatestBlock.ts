import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const json = await fetch(`${process.env.NEXT_PUBLIC_ETHERSCAN_GETH_LATEST_BLOCK_URL}`)
            .then((response) => {
                return response.json();
            });

        return res.status(200).json(json)
    } catch (err) {
        return res.status(500).send(err);
    }
};
