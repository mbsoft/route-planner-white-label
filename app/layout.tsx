import {env} from '@ncc/common/server'
import {WhiteLabelLayout} from './white-label-layout'

export const metadata = {
  title: 'Route Planner | NextBillion.ai',
  robots: {
    index: env.PROD,
    follow: env.PROD,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WhiteLabelLayout>{children}</WhiteLabelLayout>
      </body>
    </html>
  )
} 