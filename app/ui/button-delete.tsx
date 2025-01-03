import React from 'react';

function DeleteUserButton() {
    const deleteUserById = (userId: string) => {
        fetch(`http://localhost:3000/query?userId=${userId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    };

    return (
        <button onClick={() => deleteUserById('410544b2-4001-4271-9855-fec4b6a6442a')}>
            Eliminar Usuario
        </button>
    );
}

export default DeleteUserButton;
