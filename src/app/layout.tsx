import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Deep Terminal - Professional Market Analysis',
  description: 'Bloomberg Terminal meets AI. Professional market analysis simplified.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3B82F6', // Blue-600
          colorText: '#111827',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#111827',
          borderRadius: '0.75rem', // rounded-xl
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          // Customize form elements
          formButtonPrimary: 
            'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all',
          
          card: 
            'bg-white shadow-sm border border-gray-100 rounded-2xl',
          
          headerTitle: 
            'text-2xl font-bold text-gray-900',
          
          headerSubtitle: 
            'text-gray-600',
          
          formFieldInput: 
            'border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all',
          
          footerActionLink: 
            'text-blue-600 hover:text-blue-700 font-medium',
          
          identityPreviewText: 
            'text-gray-700',
          
          socialButtonsBlockButton: 
            'border-gray-200 hover:bg-gray-50 transition-all rounded-xl',
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
