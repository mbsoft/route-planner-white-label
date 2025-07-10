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
      <head>
        <link href="https://maps-gl.nextbillion.io/maps/v2/api/css" rel="stylesheet"/>
      </head>
      <body style={{ background: '#E5EEFA' }}>
        <WhiteLabelLayout>{children}</WhiteLabelLayout>
      </body>
    </html>
  )
} 
