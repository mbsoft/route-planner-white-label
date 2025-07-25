import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { WhiteLabelLayout } from '../white-label-layout'

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <WhiteLabelLayout>
        {children}
      </WhiteLabelLayout>
    </NextIntlClientProvider>
  )
} 