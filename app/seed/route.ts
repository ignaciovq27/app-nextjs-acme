import bcrypt from 'bcrypt';  /* Encriptar contraseñas */
import { db } from '@vercel/postgres'; /* BD PostgreSQL de vercel */
import { invoices, customers, revenue, users } from '../lib/placeholder-data'; /* Datos ficticios */

const client = await db.connect(); /* Se conecta BD y guarda la conexión en client, permite consultas SQL */

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  // const insertedUsers = await Promise.all(
  //   users.map(async (user) => {
  //     const hashedPassword = await bcrypt.hash(user.password, 10);
  //     return client.sql`
  //       INSERT INTO users (id, name, email, password)
  //       VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
  //       ON CONFLICT (id) DO NOTHING;
  //     `;
  //   }),
  // );

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      try {
        // Verificación de que la contraseña esté definida
        if (!user.password) {
          throw new Error(`La contraseña de ${user.name} no está definida.`);
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const result = await client.sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING;
        `;

        console.log(`Resultado de la inserción para ${user.name}:`, result);

        if (result.rowCount === 0) {
          console.log(`El usuario con id ${user.id} ya existe en la base de datos.`);
        } else {
          console.log(`Usuario ${user.name} insertado con éxito.`);
        }

        return result;
      }

      catch (error) {
        console.error(`Error al insertar el usuario ${user.name}:`, error);
        return { error: `Error al insertar el usuario ${user.name}` };
      }
    })
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

// GET REALIZAR SEED EN BD
// export async function GET() {
//   // return Response.json({
//   //   message:
//   //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
//   // });
//   try {
//     await client.sql`BEGIN`;
//     await seedUsers();
//     await seedCustomers();
//     await seedInvoices();
//     await seedRevenue();
//     await client.sql`COMMIT`;

//     return Response.json({ message: 'Database seeded successfully' });
//   } catch (error) {
//     await client.sql`ROLLBACK`;
//     return Response.json({ error }, { status: 500 });
//   }
// }

// GET REALIZAR SEED EN BD BORRANDO TODA LA INFO PREVIA EN LAS TABLAS (TRUNCATE)
export async function GET() {
  try {
    await client.sql`BEGIN`;

    // Borrar toda la información de las tablas
    await client.sql`TRUNCATE TABLE users, customers, invoices, revenue CASCADE`;

    // Insertar los datos de nuevo (Seed)
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    await client.sql`COMMIT`;

    return Response.json({ message: 'Base de datos reiniciada y sembrada exitosamente' });
  } catch (error) {
    console.log(error)
    await client.sql`ROLLBACK`;
    return Response.json({ error: 'Error al reiniciar la base de datos' }, { status: 500 });
  }
}

