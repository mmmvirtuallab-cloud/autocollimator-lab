// pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {/* ⚠️ CLEANUP: Removed the custom font class 'antialiased' as we are not using the specific Geist fonts now */}
      <body className=""> 
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}