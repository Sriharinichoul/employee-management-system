const form = document.getElementById("login-form");

const email = document.getElementById("email");

const password = document.getElementById("password");

const message = document.getElementById("message");

const showButton = document.querySelector(".show");


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

showButton.addEventListener("click", () => {

    const reveal = password.type === "password";

    password.type = reveal ? "text" : "password";

    showButton.textContent = reveal ? "Hide" : "Show";

    showButton.setAttribute(
        "aria-label",
        reveal ? "Hide password" : "Show password"
    );

});


// ===============================
// LOGIN FORM
// ===============================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    message.textContent = "";


    // ===============================
    // GET INPUT VALUES
    // ===============================

    const enteredEmail = email.value.trim();

    const enteredPassword = password.value;


    // ===============================
    // VALIDATE EMAIL
    // ===============================

    if (!enteredEmail || !email.validity.valid) {

        message.textContent =
            "Enter a valid work email address.";

        email.focus();

        return;
    }


    // ===============================
    // VALIDATE PASSWORD
    // ===============================

    if (!enteredPassword) {

        message.textContent =
            "Enter your password.";

        password.focus();

        return;
    }


    // ===============================
    // ADMIN LOGIN
    // ===============================

    const adminEmail = "admin@company.com";

    const savedAdminPassword =
        JSON.parse(
            localStorage.getItem("adminPassword")
        ) || "admin123";


    if (
        enteredEmail.toLowerCase() ===
        adminEmail.toLowerCase()
        &&
        enteredPassword === savedAdminPassword
    ) {

        localStorage.setItem(
            "loggedInRole",
            "admin"
        );

        window.location.href =
            "admin-dashboard.html";

        return;
    }


    // ===============================
    // EMPLOYEE LOGIN
    // ===============================

    try {

        const response =
            await fetch("data/employees.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load employee data."
            );

        }


        const employeesFromJSON =
            await response.json();


        // Get employees created or edited
        // through the application

        const savedEmployees =
            JSON.parse(
                localStorage.getItem("employees")
            ) || [];


        // ===============================
        // MERGE EMPLOYEE DATA
        // ===============================

        const employeeMap =
            new Map();


        employeesFromJSON.forEach(employee => {

            employeeMap.set(
                employee.employeeId,
                employee
            );

        });


        savedEmployees.forEach(employee => {

            employeeMap.set(
                employee.employeeId,
                {
                    ...employeeMap.get(
                        employee.employeeId
                    ),
                    ...employee
                }
            );

        });


        const employees =
            Array.from(
                employeeMap.values()
            );


        // ===============================
        // FIND EMPLOYEE BY EMAIL
        // ===============================

        const employee =
            employees.find(
                employee =>
                    employee.email &&
                    employee.email.toLowerCase() ===
                    enteredEmail.toLowerCase()
            );


        if (!employee) {

            message.textContent =
                "Invalid email or password.";

            return;
        }


        // ===============================
        // GET EMPLOYEE PASSWORD
        // ===============================

        const savedPasswords =
            JSON.parse(
                localStorage.getItem(
                    "employeePasswords"
                )
            ) || {};


        const employeePassword =
            savedPasswords[employee.employeeId]
            ||
            employee.password
            ||
            "employee123";


        // ===============================
        // CHECK PASSWORD
        // ===============================

        if (
            enteredPassword !==
            employeePassword
        ) {

            message.textContent =
                "Invalid email or password.";

            return;
        }


        // ===============================
        // SAVE CURRENT EMPLOYEE
        // ===============================

        localStorage.setItem(
            "currentEmployeeId",
            employee.employeeId
        );


        localStorage.setItem(
            "loggedInRole",
            "employee"
        );


        // ===============================
        // FIRST LOGIN CHECK
        // ===============================

        if (employee.firstLogin === true) {

            window.location.href =
                "employee-profile.html";

            return;
        }


        // ===============================
        // NORMAL EMPLOYEE LOGIN
        // ===============================

        window.location.href =
            "employee-dashboard.html";


    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to the employee data.";

    }

});