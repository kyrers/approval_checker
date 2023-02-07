import { ReactNode } from "react";
import { createClient, configureChains } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import Head from "next/head";
import useIsMounted from "../hooks/useIsMounted";

export default function Layout({ children }: { children: ReactNode }) {
    const { mounted } = useIsMounted();

    const { chains, provider, webSocketProvider } = configureChains(
        [mainnet, optimism],
        [
            alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY ?? "" }),
            alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_OPTIMISM_ALCHEMY_KEY ?? "" })
        ]
    );

    const wagmiClient = createClient({
        provider,
        webSocketProvider,
        autoConnect: true,
        connectors: [
            /* 
            There's a bug in MetaMask extension that causes disconnect events to sometimes be fired when switching chains.
            Frequently occurs when chains are not MM default.
            See: https://github.com/wagmi-dev/wagmi/issues/563 and https://github.com/MetaMask/metamask-extension/issues/13375
            TO DO: Hotfix this somehow
            */
            new MetaMaskConnector({ chains })
        ],
    });

    if (!mounted) {
        return <></>;
    }

    return (
        <WagmiConfig client={wagmiClient}>
            <Head>
                <title>What have I approved?</title>
                <meta name="description" content="Check your wallet approvals" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {children}
        </WagmiConfig>
    );
};