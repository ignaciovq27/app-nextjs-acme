import { db } from "@vercel/postgres";

// Función para obtener las facturas
async function getInvoices() {
  const invoicesData = await db.sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;
  return invoicesData.rows;
}

// Función para obtener los usuarios
async function getUsers() {
  const usersData = await db.sql`
    SELECT name FROM users;
  `;
  return usersData.rows;
}

// Función para gestionar la solicitud GET
export async function GET(request: Request) {
  console.log(request)

  try {
    const invoicesData = await getInvoices();
    const usersData = await getUsers();
    return Response.json({ invoices: invoicesData, users: usersData });
  }

  catch (error) {
    console.log(error);
    return Response.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}

// Función para eliminar un usuario por ID
async function deleteUser(userId: string) {
  const deleteResult = await db.sql`
    DELETE FROM users WHERE id = ${userId};
  `;
  return deleteResult.rowCount; // Devuelve el número de filas eliminadas
}

// Función para gestionar la solicitud DELETE
export async function DELETE(request: Request) {
  try {
    // Obtener el `userId` de los parámetros de la URL
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: 'Falta el parámetro userId' }, { status: 400 });
    }

    // Verificar si el usuario existe antes de eliminarlo
    const checkUser = await db.sql`
      SELECT * FROM users WHERE id = ${userId};
    `;
    if (checkUser.rows.length === 0) {
      return Response.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Llamar a la función deleteUser para eliminar al usuario
    const rowsDeleted = await deleteUser(userId);
    console.log(`Rows deleted: ${rowsDeleted}`); // Depuración: verificar cuántas filas se eliminaron

    if (rowsDeleted! > 0) {
      return Response.json({ message: 'Usuario eliminado con éxito' });
    } else {
      return Response.json({ message: 'No se encontró el usuario' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error al procesar la solicitud:', error); // Depuración: imprimir el error
    return Response.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
