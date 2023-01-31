import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { lazy, Suspense } from "react";
import InitialLoad from '@/components/InitialLoad';

const Layout = lazy(() => import("../components/Layout"));

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback={<InitialLoad />}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Suspense>
  );
};