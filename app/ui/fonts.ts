import { Inter, Lusitana } from 'next/font/google';
// import { Lusitana } from 'next/font/google'; forse causa errore di deploy?
export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ weight: ['400', '700'], subsets: ['latin'] });