import "./globals.css";
import Providers from './providers'
import { Toaster } from "react-hot-toast";
import Script from "next/script";

function RootLayout({children}){
  return(
    <>
      <html>
        <head>
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />
        </head>
        <body className="">
          <Providers>{children}</Providers>
          <Toaster/>
        </body>
      </html>
    </>
  )
}
export default RootLayout;
