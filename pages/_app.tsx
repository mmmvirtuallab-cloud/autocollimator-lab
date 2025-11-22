// pages/_app.tsx
import "@/styles/globals.css"; // Correctly imports styles
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}