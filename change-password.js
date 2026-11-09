// ===============================
// LOAD CURRENT EMPLOYEE
// ===============================

const defaultEmployeeId = "EMP001";

const currentEmployeeId =
    localStorage.getItem("currentEmployeeId") || defaultEmployeeId;


// ===============================
// LOAD EMPLOYEE DATA
// ===============================

async function loadEmployee() {

    try {

        const response = await fetch("data/employees.json");

        if (!response.ok) {
            throw new Error("Unable to load employee data.");
        }

        const employeesFromJSON = await response.json();

        const savedEmployees =
            JSON.parse(localStorage.getItem("employees")) || [];


        // Merge JSON and localStorage employees

        const employeeMap = new Map();

        employeesFromJSON.forEach(employee => {
            employeeMap.set(employee.employeeId, employee);
        });

        savedEmployees.forEach(employee => {

            employeeMap.set(employee.employeeId, {
                ...employeeMap.get(employee.employeeId),
                ...employee
            });

        });


        const employees = Array.from(employeeMap.values());


        const employee = employees.find(
            employee =>
                employee.employeeId === currentEmployeeId
        );


        if (!employee) {

            alert("Employee information could not be found.");

            window.location.href = "index.html";

            return null;
        }


        return employee;

    } catch (error) {

        console.error(error);

        alert("Unable to load employee information.");

        return null;
    }
}


// ===============================
// DISPLAY EMPLOYEE NAME
// ===============================

async function initializePage() {

    const employee = await loadEmployee();

    if (!employee) {
        return;
    }


    const fullName =
        `${employee.firstName || ""} ${employee.lastName || ""}`.trim();


    const headerName =
        document.getElementById("headerEmployeeName");


    if (headerName) {

        headerName.textContent =
            fullName || "Employee";

    }

}


initializePage();


// ===============================
// CHANGE PASSWORD
// ===============================

document
    .getElementById("changePasswordForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const currentPassword =
            document.getElementById("currentPassword").value;

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // ===============================
        // GET SAVED PASSWORDS
        // ===============================

        const savedPasswords =
            JSON.parse(
                localStorage.getItem("employeePasswords")
            ) || {};


        /*
         * If the employee has never changed
         * their password, use the default
         * password from employees.json.
         */

        const existingPassword =
            savedPasswords[currentEmployeeId]
            || "employee123";


        // ===============================
        // VALIDATE CURRENT PASSWORD
        // ===============================

        if (currentPassword !== existingPassword) {

            alert("Current password is incorrect.");

            return;
        }


        // ===============================
        // VALIDATE NEW PASSWORD
        // ===============================

        if (newPassword.length < 8) {

            alert(
                "Password must contain at least 8 characters."
            );

            return;
        }


        // ===============================
        // CONFIRM PASSWORD
        // ===============================

        if (newPassword !== confirmPassword) {

            alert(
                "New password and confirm password do not match."
            );

            return;
        }


        // ===============================
        // CHECK SAME PASSWORD
        // ===============================

        if (newPassword === currentPassword) {

            alert(
                "New password must be different from the current password."
            );

            return;
        }


        // ===============================
        // SAVE NEW PASSWORD
        // ===============================

        savedPasswords[currentEmployeeId] =
            newPassword;


        localStorage.setItem(
            "employeePasswords",
            JSON.stringify(savedPasswords)
        );


        alert("Password changed successfully!");


        // Clear form

        document
            .getElementById("changePasswordForm")
            .reset();

    });


// ===============================
// LOGOUT
// ===============================

document
    .getElementById("employeeLogout")
    .addEventListener("click", function (event) {

        event.preventDefault();


        const confirmLogout =
            confirm("Are you sure you want to logout?");


        if (confirmLogout) {

            localStorage.removeItem("currentEmployeeId");

            localStorage.removeItem("loggedInRole");

            window.location.href = "index.html";

        }

    });