import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  try {
    const messages = await getMessages();
    return (
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    );
  } catch (error) {
    console.error('Failed to load messages:', error);
    return (
      <div>
        <div>Error loading translations. Please try again.</div>
        {children}
      </div>
    );
  }
}
