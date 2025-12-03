import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'PolishPic - #1 AI Headshot Generator for Professionals 2025',
  description: 'Studio-quality business headshots in minutes. Natural AI enhancements, corporate backdrops. Trusted by 50k+ pros.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased`}>{children}</body>
    </html>
  )
}
