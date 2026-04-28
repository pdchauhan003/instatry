import "./globals.css";
import Providers from './providers'
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import SocketProvider from "@/app/SocketProvider";

function RootLayout({children}){
  return(
    <>
      <html lang="en">
        <head>
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />
        </head>
        <body className="">
          <Providers>
            <SocketProvider>
              {children}
            </SocketProvider>
          </Providers>
          <Toaster/>
        </body>
      </html>
    </>
  )
}
export default RootLayout;
