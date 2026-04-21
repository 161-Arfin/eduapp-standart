import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";
import { Provider } from "react-redux";
import store from "@/lib/redux/store";

const poppins = Poppins({
  weight: ["400", "700", "800", "900"],
  subsets: ["latin"],
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        <main className={poppins.className}>
          <Component {...pageProps} />
        </main>
      </SessionProvider>
    </Provider>
  );
}
