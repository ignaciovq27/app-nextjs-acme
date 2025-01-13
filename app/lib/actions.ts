'use server';

//DATABASE
import { sql } from '@vercel/postgres';

//CACHE & NAVIGATION
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

//ZOD
import { z } from 'zod';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });

//Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),


        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    }
    // catch (error) {
    //     return {
    //         message: 'Database Error: Failed to Create Invoice.',
    //     };

    catch (error) {
        // Instead of returning an object, we'll throw an error
        throw new Error('Database Error: Failed to Create Invoice.');
    }

    console.log('Invoice created!');
    console.log({ customerId, amount, amountInCents, status });

    // Revalidate the Invoices page cache with the new data from the database
    revalidatePath('/dashboard/invoices');

    // Redirect to the Invoices page after creating the invoice
    redirect('/dashboard/invoices');
}

//Update the invoice in the database
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
          UPDATE invoices
          SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
          WHERE id = ${id}
        `;
    }
    catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

//Delete the invoice from the database
export async function deleteInvoice(id: string) {

    // Throw an error if the deletion fails
    // throw new Error('Failed to Delete Invoice');

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        // return { message: 'Deleted Invoice.' };
    }

    // catch (error) {
    //     return { message: 'Database Error: Failed to Delete Invoice.' };
    // }
    catch (error) {
        // Instead of returning an object, we'll throw an error
        throw new Error('Database Error: Failed to Delete Invoice.');
    }
}