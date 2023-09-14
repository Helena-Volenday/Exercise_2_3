This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

1. Log into MyAQL: `mysql -u root -p`

2. Create the database as:

```
create the database

CREATE DATABASE employee_records;

USE employee_records;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  birthday DATE NOT NULL,
  age INT
);
```

3. Then, I created a trigger so the database calculates the age on it's own:

For the insert of a new employee:

```
DELIMITER //
CREATE TRIGGER calculate_age
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    SET NEW.age = YEAR(CURDATE()) - YEAR(NEW.birthday) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(NEW.birthday, '%m%d'));
END;
//
DELIMITER ;
```

For an update:

```
DELIMITER //
CREATE TRIGGER calculate_age_update
BEFORE UPDATE ON employees
FOR EACH ROW
BEGIN
    SET NEW.age = YEAR(CURDATE()) - YEAR(NEW.birthday) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(NEW.birthday, '%m%d'));
END;
//
DELIMITER ;
```

As birthdays happen, I have a script in `pages/api/scripts/updateEmployeeAges.js` that has to be scheduled, for example, everyday at 00:00 to update the age. It can also be executed manually with node.

The information for the database connection is stored in an `.env.local` file.

### About the web

1. All the fields must be filled for the "Add Employee" button to be enabled.
2. The date cannot be later than today (this can be ajusted as needed).
3. Use the "Show/Hide Actions" nutton to Delete or Update an employee.
4. When editing an employee, the date restrictions remain.

### About the appearance

Basic use of ant design.

I decided to keep all the functionallities on the same page, as it is easier to use for the end user. (They doesn't have to keep jumping between links).
