import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';
import { Metadata } from 'next';
import { Suspense } from 'react';

// per testare i metadai targettati ad una pagina con aggiunta del placeholder del template
export const metadata: Metadata = {
  title: 'Login Page'
}
 
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <Suspense> {/* perché deve accedere ad info che vengono dai param dell'url */}
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}