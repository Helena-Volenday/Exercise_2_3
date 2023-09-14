// pages/index.js

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
/** Import the css files */
import '../app/styles/button.css';
import '../app/styles/form.css';
import '../app/styles/header.css';
import '../app/styles/table.css';

import * as yup from 'yup';

const nameSchema = yup
	.string()
	.required('First name is required')
	.min(2, 'First name must be at least 2 characters')
	.matches(/^[a-zA-Z]+$/, 'Name should contain only letters');
const dateSchema = yup.date().max(new Date(), 'Date cannot be in the future').required('Date is required');

export default function Home() {
	const queryClient = useQueryClient();
	const { isLoading, error, data: employees } = useQuery('employees', fetchEmployees);

	// State and validation for the Add Employee form
	const [addDateError, setAddDateError] = useState(false);
	const [addDisableButton, setAddDisableButton] = useState(true);

	// State and validation for the Update Employee form
	const [updateDateError, setUpdateDateError] = useState(false);
	const [updateDisableButton, setUpdateDisableButton] = useState(false);

	const mutation = useMutation(createEmployee, {
		onSettled: () => {
			// After a successful mutation, invalidate the 'employees' query to trigger a refetch
			queryClient.invalidateQueries('employees');
		}
	});

	const update = useMutation(updateEmployee, {
		onSettled: () => {
			// After a successful mutation, invalidate the 'employees' query to trigger a refetch
			queryClient.invalidateQueries('employees');
		}
	});

	const [selectedEmployee, setSelectedEmployee] = useState(null);
	const [addEmployeeFormData, setAddEmployeeFormData] = useState({
		firstName: '',
		lastName: '',
		birthday: ''
	});

	const [updateEmployeeFormData, setUpdateEmployeeFormData] = useState({
		firstName: '',
		lastName: '',
		birthday: ''
	});

	const handleAddInputChange = e => {
		const { name, value } = e.target;

		// Update the corresponding form data state
		setAddEmployeeFormData({ ...addEmployeeFormData, [name]: value });

		if (name === 'birthday') {
			const isValidDate = dateSchema.isValidSync(value);
			setAddDateError(!isValidDate);
		}

		// Validate first and last name with yup
		if (name === 'firstName' || name === 'lastName') {
			const isValidName = nameSchema.isValidSync(value);
			const isValidDate = dateSchema.isValidSync(addEmployeeFormData.birthday);
			if (name === 'firstName') {
				// Only update the button state when it's the first name input
				setAddDisableButton(!isValidName || !isValidDate || addEmployeeFormData.lastName === '');
			} else {
				// Update the button state when it's the last name input
				setAddDisableButton(!isValidName || !isValidDate || addEmployeeFormData.firstName === '');
			}
		} else {
			// Update the button state when it's the birthday input
			setAddDisableButton(
				!dateSchema.isValidSync(addEmployeeFormData.birthday) ||
					!nameSchema.isValidSync(addEmployeeFormData.firstName) ||
					!nameSchema.isValidSync(addEmployeeFormData.lastName)
			);
		}
	};

	const handleUpdateInputChange = e => {
		const { name, value } = e.target;

		// Update the corresponding form data state
		setUpdateEmployeeFormData({ ...updateEmployeeFormData, [name]: value });

		if (name === 'birthday') {
			// Validate the date input with yup (required and max today) and update the corresponding error state
			const isValidDate = dateSchema.isValidSync(value);
			setUpdateDateError(!isValidDate);
		}

		// Validate first and last name with yup
		if (name === 'firstName' || name === 'lastName') {
			const isValidName = nameSchema.isValidSync(value);
			const isValidDate = dateSchema.isValidSync(updateEmployeeFormData.birthday);
			// Update the button state based on both first and last names being valid
			if (name === 'firstName') {
				// Only update the button state when it's the first name input
				setUpdateDisableButton(!isValidName || !isValidDate || updateEmployeeFormData.lastName === '');
			} else {
				// Update the button state when it's the last name input
				setUpdateDisableButton(!isValidName || !isValidDate || updateEmployeeFormData.firstName === '');
			}
		} else {
			// Update the button state when it's the birthday input
			setUpdateDisableButton(
				!dateSchema.isValidSync(updateEmployeeFormData.birthday) ||
					!nameSchema.isValidSync(updateEmployeeFormData.firstName) ||
					!nameSchema.isValidSync(updateEmployeeFormData.lastName)
			);
		}
	};

	const handleSubmit = (e, employee) => {
		e.preventDefault();
		if (selectedEmployee) {
			// Call the update mutation to update the selected employee
			update.mutate({ employee, ...updateEmployeeFormData });
		} else {
			// Call the mutation to create a new employee
			mutation.mutate(addEmployeeFormData);
		}

		// Clear the form data
		setAddEmployeeFormData({
			firstName: '',
			lastName: '',
			birthday: ''
		});
		setUpdateEmployeeFormData({
			firstName: '',
			lastName: '',
			birthday: ''
		});
		// Close the editing form
		setSelectedEmployee(null);
	};

	const handleEmployeeClick = employeeId => {
		// Toggle the selected employee
		if (selectedEmployee === employeeId) {
			setSelectedEmployee(null);
			// clear the update form data
			setUpdateEmployeeFormData({
				firstName: '',
				lastName: '',
				birthday: ''
			});
		} else {
			setSelectedEmployee(employeeId);
			// Put all the employee's data (first and last name and birthdate) in the update form
			const employee = employees.find(employee => employee.id === employeeId);
			setUpdateEmployeeFormData({
				firstName: employee.first_name,
				lastName: employee.last_name,
				birthday: employee.birthday
			});
		}
	};

	const handleDeleteClick = async employee => {
		// Send a DELETE request to the API to delete the employee
		await fetch('/api/employees/delete', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(employee)
		}).then(() => {
			// Refresh the employees list after deletion
			queryClient.invalidateQueries('employees');
		});
	};

	return (
		<div className="container">
			<h1>Employee Management</h1>

			<form onSubmit={e => handleSubmit(e)}>
				<div className="input-container">
					<input
						type="text"
						name="firstName"
						placeholder="First Name"
						value={addEmployeeFormData.firstName}
						onChange={handleAddInputChange}
					/>
					<input
						type="text"
						name="lastName"
						placeholder="Last Name"
						value={addEmployeeFormData.lastName}
						onChange={handleAddInputChange}
					/>
				</div>
				<div className="input-container">
					<input
						type="date"
						name="birthday"
						value={addEmployeeFormData.birthday}
						onChange={handleAddInputChange}
						className={addDateError ? 'error-input' : ''}
					/>
					{addDateError && <p className="error-message">Ivalid date</p>}
					<button type="submit" disabled={addDisableButton}>
						Add Employee
					</button>
				</div>
			</form>

			<div style={{ margin: '20px 0' }}></div>

			{/* Display the employees list */}
			<h2>Employees</h2>

			<table>
				<thead>
					<tr>
						<th className="table-header">Name</th>
						<th className="table-header">Birth date</th>
					</tr>
				</thead>
				<tbody>
					{isLoading ? (
						<tr>
							<td className="table-cell" colSpan="3">
								Loading employee data...
							</td>
						</tr>
					) : error ? (
						<tr>
							<td className="table-cell" colSpan="3">
								An error has occurred: {error.message}
							</td>
						</tr>
					) : (
						employees.map(employee => (
							<tr key={employee.id}>
								<td className="table-cell">
									{employee.first_name} {employee.last_name}
								</td>
								<td className="table-cell">
									{new Date(employee.birthday).toLocaleDateString()} ({employee.age})
								</td>
								<td className="table-cell">
									<button onClick={() => handleEmployeeClick(employee.id)}>
										{selectedEmployee === employee.id ? 'Hide' : 'Show'} Actions
									</button>
								</td>

								{selectedEmployee === employee.id && (
									<td className="action-cell">
										<button onClick={() => handleDeleteClick(employee)} className="red-button">
											Delete
										</button>
										{/* Form for editing an employee */}
										<form onSubmit={e => handleSubmit(e, employee)}>
											<div className="input-container">
												<input
													type="text"
													name="firstName"
													value={updateEmployeeFormData.firstName || employee.first_name}
													onChange={handleUpdateInputChange}
												/>
												<input
													type="text"
													name="lastName"
													value={updateEmployeeFormData.lastName || employee.last_name}
													onChange={handleUpdateInputChange}
												/>
											</div>
											<div className="input-container">
												<input
													type="date"
													name="birthday"
													value={
														updateEmployeeFormData.birthday ||
														(employee && employee.birthday) ||
														''
													}
													onChange={handleUpdateInputChange}
													className={updateDateError ? 'error-input' : ''}
												/>
												<button type="submit" disabled={updateDisableButton}>
													Update Employee
												</button>
											</div>
										</form>
									</td>
								)}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}

const fetchEmployees = async () => {
	const res = await fetch('/api/employees/read');
	const data = await res.json();

	// Format the birthdate for each employee
	const formattedData = data.map(employee => ({
		...employee,
		birthday: new Date(employee.birthday).toISOString().split('T')[0] // Format as 'YYYY-MM-DD'
	}));

	return formattedData;
};

const createEmployee = async formData => {
	await fetch('/api/employees/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(formData)
	});
};

const updateEmployee = async ({ employee, ...newEmployeeData }) => {
	/** if one of the newEmployee data is blank, use the employee field instead*/
	newEmployeeData.id = employee.id;
	if (newEmployeeData.firstName === '') {
		newEmployeeData.firstName = employee.first_name;
	}
	if (newEmployeeData.lastName === '') {
		newEmployeeData.lastName = employee.last_name;
	}
	if (newEmployeeData.birthday === '') {
		newEmployeeData.birthday = employee.birthday;
	}

	await fetch(`/api/employees/update`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(newEmployeeData)
	});
};
