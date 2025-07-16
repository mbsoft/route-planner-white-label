import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { WhiteLabelLayout } from '../white-label-layout'
import { locales } from '../../i18n'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <link href="https://maps-gl.nextbillion.io/maps/v2/api/css" rel="stylesheet"/>
      </head>
      <body style={{ background: '#E5EEFA' }}>
        <NextIntlClientProvider messages={messages}>
          <WhiteLabelLayout>{children}</WhiteLabelLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  )
} 