import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PolishPic - Free Online AI Headshot Generator',
  description: 'Create professional headshots from your selfie with AI. Natural enhancements for business profiles.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
