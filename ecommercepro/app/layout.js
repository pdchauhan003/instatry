import "./globals.css";
import Providers from './providers'
import { Toaster } from "react-hot-toast";
function RootLayout({children}){
  return(
    <>
      <html>
        <body className="">
          <Providers>{children}</Providers>
          <Toaster/>
        </body>
      </html>
    </>
  )
}
export default RootLayout;