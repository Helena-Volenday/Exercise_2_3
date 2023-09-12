// pages/index.js

"use client"; // This is a client component 
import { useState, useEffect } from 'react';
import '@/app/styles/table.css'

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', birthday: '' });

  useEffect(() => {
    // Fetch employees from the API and update the employees state
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send a POST request to create a new employee
    fetch('/api/employees/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        // Refresh the employees list
        fetch('/api/employees')
          .then((res) => res.json())
          .then((data) => setEmployees(data));
        // Clear the form data
        setFormData({ firstName: '', lastName: '', birthday: '' });
      });
  };

  return (
    <div>
      <h1>Employee Management</h1>

      <div style={{ margin: '20px 0' }}></div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={handleInputChange}
        />
        <button type="submit">Add Employee</button>
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
          {employees ? (
            employees.map((employee) => (
              <tr key={employee.id}>
                <td className="table-cell">{employee.first_name} {employee.last_name}</td>
                <td className="table-cell">
                  {new Date(employee.birthday).toLocaleDateString()} ({employee.age})
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="table-cell" colSpan="2">
                Loading employee data...
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
