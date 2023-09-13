// updateEmployeeAges.js
require('dotenv').config({ path: '../../../.env.local' });
const db = require('../../../db');

db.connect(err => {
	if (err) throw err;
	console.log('Connected to the database');

	// Retrieve employees and their birthdates
	db.query('SELECT id, birthday FROM employees', (err, results) => {
		if (err) throw err;

		results.forEach(employee => {
			const { id, birthday } = employee;
			const birthdate = new Date(birthday);
			const today = new Date();
			const age =
				today.getFullYear() -
				birthdate.getFullYear() -
				(today.getMonth() < birthdate.getMonth() ||
				(today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())
					? 1
					: 0);

			// Update age in the database
			db.query('UPDATE employees SET age = ? WHERE id = ?', [age, id], (err, result) => {
				if (err) throw err;
			});
		});

		// Close the database connection
		db.end(err => {
			if (err) throw err;
			console.log('Disconnected from the database');
		});
	});
});
