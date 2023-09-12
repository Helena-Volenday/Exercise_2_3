import db from '../../../db';

export default async (req, res) => {
    if (req.method === 'PUT') {
        try {
            const { id, firstName, lastName, birthday } = req.body;
            const query = `UPDATE employees SET first_name = ?, last_name = ?, birthday = ? WHERE id = ?`;
            await db.promise().execute(query, [firstName, lastName, birthday, id]);
            res.status(200).json({ message: 'Employee updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};