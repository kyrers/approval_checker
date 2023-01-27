import "../styles/globals.css";
import type { AppProps } from "next/app";
import { lazy, Suspense } from "react";

const Layout = lazy(() => import("../components/Layout"));

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Suspense>
  );
};