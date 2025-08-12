import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  console.log('🔍 LocaleLayout: Starting...');
  
  try {
    const { locale } = await params; // Await params to access locale
    console.log('🔍 LocaleLayout: Params resolved, locale:', locale);
    
    console.log('🔍 LocaleLayout: About to call getMessages()...');
    const messages = await getMessages();
    console.log('🔍 LocaleLayout: getMessages() succeeded, messages keys:', Object.keys(messages));
    
    return (
      <html lang={locale}>
        <body>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error) {
       throw error;
  }
}
