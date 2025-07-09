import {WhiteLabelLayout} from './white-label-layout'

export const metadata = {
  title: 'Route Planner White Label',
  description: 'White-label route planning application for logistics optimization',
  robots: {
    index: true,
    follow: true,
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
