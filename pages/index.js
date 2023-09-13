// pages/index.js

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import '@/app/styles/table.css';
import '@/app/styles/form.css';
import '@/app/styles/button.css';
import '@/app/styles/header.css';

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

	//const [formData, setFormData] = useState({ firstName: '', lastName: '', birthday: '' });
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

	const handleInputChange = e => {
		const { name, value } = e.target;

		// Update the corresponding form data state
		if (selectedEmployee) {
			setUpdateEmployeeFormData({ ...updateEmployeeFormData, [name]: value });
		} else {
			setAddEmployeeFormData({ ...addEmployeeFormData, [name]: value });
		}

		// Validate the date input
		if (name === 'birthday') {
			const selectedDate = new Date(value);
			const currentDate = new Date();

			if (selectedDate > currentDate) {
				// Update the corresponding error state and button state
				if (selectedEmployee) {
					setUpdateDateError(true);
					setUpdateDisableButton(true);
				} else {
					setAddDateError(true);
					setAddDisableButton(true);
				}
			} else {
				// Update the corresponding error state and button state
				if (selectedEmployee) {
					setUpdateDateError(false);
					setUpdateDisableButton(false);
				} else {
					setAddDateError(false);
					setAddDisableButton(false);
				}
			}
		}

		// Check if any of the fields are empty
		const isAnyFieldEmpty =
			addEmployeeFormData.firstName === '' ||
			addEmployeeFormData.lastName === '' ||
			addEmployeeFormData.birthday === '';

		// Enable or disable the Add Employee button based on the empty fields
		setAddDisableButton(isAnyFieldEmpty);
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
		} else {
			setSelectedEmployee(employeeId);
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
						onChange={handleInputChange}
					/>
					<input
						type="text"
						name="lastName"
						placeholder="Last Name"
						value={addEmployeeFormData.lastName}
						onChange={handleInputChange}
					/>
				</div>
				<div className="input-container">
					<input
						type="date"
						name="birthday"
						value={addEmployeeFormData.birthday}
						onChange={handleInputChange}
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
													onChange={handleInputChange}
												/>
												<input
													type="text"
													name="lastName"
													value={updateEmployeeFormData.lastName || employee.last_name}
													onChange={handleInputChange}
												/>
											</div>
											<div className="input-container">
												<input
													type="date"
													name="birthday"
													value={updateEmployeeFormData.birthday || employee.birthday}
													onChange={handleInputChange}
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

// Define your data fetching function
const fetchEmployees = async () => {
	const res = await fetch('/api/employees');
	const data = await res.json();
	return data;
};

// Define your mutation function
const createEmployee = async formData => {
	await fetch('/api/employees/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(formData)
	});
};

const updateEmployee = async ({ employee, ...newEmployeeData }) => {
	/** if on of the newEmployee data is blank, use the employee field instead*/
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
