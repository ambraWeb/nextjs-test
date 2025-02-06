import '@/app/ui/global.css';
import { inter } from './ui/fonts';
import { Metadata } from 'next';

export const experimental_ppr = true;

export const metadata: Metadata = {
  title: { 
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard' // è il default se faccio `title: 'cose'` e non l'oggetto `title`
  },
  description: 'Una descrizione',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} >{children}</body>
    </html>
  );
}
