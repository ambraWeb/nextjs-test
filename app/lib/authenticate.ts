'use client';

// tentativo di far funzionare senza dover usare signIn per evitare il problema server e client
export async function authenticate(
  prevState: string | undefined,
   formData: FormData
  ) {
  try {
    const data = Object.fromEntries(formData.entries()); // converto formData in object
    return data; // ritorno dati
  } catch (error) {
    return "Something went wrong";
  }
}
