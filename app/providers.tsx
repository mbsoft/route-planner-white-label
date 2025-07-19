'use client'

import { LanguageProvider } from '../contexts/language-context'
import { WhiteLabelLayout } from './white-label-layout'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WhiteLabelLayout>
        {children}
      </WhiteLabelLayout>
    </LanguageProvider>
  )
} 