import db from '../../../db';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      // Parse the request body to get the form data
      const { firstName, lastName, birthday } = req.body;
      console.log('req.body: ' + JSON.stringify(req.body));

      // Insert the new employee into the database
      const query = 'INSERT INTO employees (first_name, last_name, birthday) VALUES (?, ?, ?)';
      console.log(query);
      await db.promise().execute(query, [firstName, lastName, birthday]);

      // Return a success response
      res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

