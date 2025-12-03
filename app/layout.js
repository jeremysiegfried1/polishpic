import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PolishPic - AI Headshot Enhancer for Business Pros',
  description: 'Generate professional LinkedIn headshots in seconds. Natural enhancements, corporate backdrops, no fakes.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
