import db from '../../../db';

export default async (req, res) => {
	if (req.method !== 'GET') {
		res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const query = 'SELECT * FROM employees';
		const [rows] = await db.promise().query(query);
		res.status(200).json(rows);
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
