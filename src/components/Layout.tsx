import Head from "next/head";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {

    return (
        <>
            <Head>
                <title>What have I approved?</title>
                <meta name="description" content="Check your wallet approvals" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {children}
        </>
    );
};
