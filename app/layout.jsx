import { Inter } from "next/font/google"
import "@app/globals.css"

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "App",
  description: "",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={
          "min-h-screen antialiased " + fontSans.className
        }
      >
        {children}
      </body>
    </html>
  )
}
