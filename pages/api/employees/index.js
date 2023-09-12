// pages/api/employees/index.js
import db from '../../../db';

export default async (req, res) => {
  if (req.method === 'GET') {
    try {
      const query = 'SELECT id, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") as birthday, age FROM employees';
      const [rows] = await db.promise().query(query);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
