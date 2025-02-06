'use server'; // marca tutte le funzioni esportate dal file come Server Actions, importabili poi nei component Client e Server. quelle inutilizzati vengono rimosse nella build

// si può fare direttamente all'interno dei server component scrivendolo dentro all'azione (tipo prima di un return con una query)
// meglio farle in un file separato ed organizzato però, come un service


import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthError } from "next-auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status',
  }),
  date: z.string()
});


const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};


/****** CREATE INVOICE ******/

export async function createInvoice(prevState: State, formData: FormData) {

  // valida il form con Zod
  const validatedFields = CreateInvoice.safeParse({
//  const {customerId, amount, status} = CreateInvoice.parse({
//  const rawFormData = {

    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // se la validazione del form fallisce, ritorna errore, sennò avanti
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. failed to create invoice',
    };
  }

  const {customerId, amount, status} = validatedFields.data; // solo alla fine preparo i dati per il db
  const amountInCents = amount * 100; //storare valori monetari in cent per evitare floating point error di js
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) { // ritornando errore dal db
    return {
      message: 'Database error: failed to create invoice'
    }
  }

  revalidatePath('/dashboard/invoices'); //cleara la path dalla cache per un rerender che contiene i nuovi dati nel db
  //redirect funziona lanciando un errore a quanto pare, quindi farebbe partire il catch, quindi lo si chiama fuori dal blocco try catch
  redirect('/dashboard/invoices'); //redirect alla pagina delle invoices finita la creazione

  // Test it out:
  // console.log(rawFormData);
  // console.log(typeof rawFormData.amount);
}


/****** UPDATE INVOICE ******/

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
  //const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update Invoice' 
    }
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;  
  } catch (error) {
    return { message: 'Database error, failed to update Invoice'}
  }
  
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


/****** DELETE INVOICE ******/

export async function deleteInvoice(id: string) {

  // errore uncaught manuale di testing
  // throw new Error('nooooo'); // usiamo un error.tsx per mostrarli in modo decente ad un utente

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices'); // questo per rivalidare la cache e rifetchare i dati dal db
}

// non funziona perché è server code che viene runnato da client! devo autenticare manualmente processando io i dati in un file con codice client
/*
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    //soluz momentanea, commenta linea sotto poi 
    const data = Object.fromEntries(formData.entries()); // converto formData in object
    await signIn('credentials', data); // riporta data a formData dopo
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials';
        default:
          return 'Something went wrong';
      }
    }
    throw error;
  }
}
  */