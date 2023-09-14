import db from '../../../db';

/** Delete a user from the database */
export default async (req, res) => {
	if (req.method !== 'DELETE') {
		res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { id, firstName, lastName, birthday } = req.body;
		const query = `DELETE FROM employees WHERE id = ?`;
		await db.promise().execute(query, [id]);
		res.status(200).json({ message: 'Employee deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
