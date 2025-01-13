'use server';

//DATABASE
import { sql } from '@vercel/postgres';

//CACHE & NAVIGATION
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

//ZOD
import { z } from 'zod';

// Se actualiza Schema para validación con errores (Chapter 14)
const FormSchema = z.object({
    id: z.string(),
    // customerId: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

//Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

// export async function createInvoice(formData: FormData) {
// const { customerId, amount, status } = CreateInvoice.parse({

export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form fields using Zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    console.log(validatedFields)  // validateFields vacio para comprobar funcionamiento

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insert data into the database
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
        // }
        // catch (error) {
        //     return {
        //         message: 'Database Error: Failed to Create Invoice.',
        //     };

        // catch (error) {
        //     // Instead of returning an object, we'll throw an error
        //     console.log(error)
        //     throw new Error('Database Error: Failed to Create Invoice.');
        // }

    } catch (error) {
        // If a database error occurs, return a more specific error.
        console.error('Database error:', error);
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    console.log('Invoice created!');
    console.log({ customerId, amount, amountInCents, status });

    // // Revalidate the cache for the invoices page with the new data from the database
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
        console.log(error)
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
    //     console.log(error)
    //     return { message: 'Database Error: Failed to Delete Invoice.' };
    // }

    catch (error) {
        console.log(error)
        // Instead of returning an object, we'll throw an error
        throw new Error('Database Error: Failed to Delete Invoice.');
    }
}