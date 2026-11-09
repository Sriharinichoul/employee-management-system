// ===============================
// STORE EXISTING EMPLOYEES
// ===============================


// Employment status color

const employeeStatusSelect = document.getElementById("status");

function updateEmployeeStatusColor() {
    employeeStatusSelect.classList.remove(
        "status-active",
        "status-inactive"
    );

    if (employeeStatusSelect.value === "Active") {
        employeeStatusSelect.classList.add("status-active");
    } else {
        employeeStatusSelect.classList.add("status-inactive");
    }
}

employeeStatusSelect.addEventListener(
    "change",
    updateEmployeeStatusColor
);

updateEmployeeStatusColor();


let existingEmployees = [];


// ===============================
// LOAD DEPARTMENTS AND MANAGERS
// ===============================

async function loadDepartments() {

    try {

        // Load departments from JSON

        const response =
            await fetch("data/departments.json");

        if (!response.ok) {
            throw new Error("Unable to load departments.");
        }

        const departmentsFromJSON =
            await response.json();


        const savedDepartments =
            JSON.parse(
                localStorage.getItem("departments")
            ) || [];


        // Merge JSON and localStorage departments

        const departmentMap = new Map();

        departmentsFromJSON.forEach(department => {

            departmentMap.set(
                department.departmentId,
                department
            );

        });


        savedDepartments.forEach(department => {

            departmentMap.set(
                department.departmentId,
                {
                    ...departmentMap.get(
                        department.departmentId
                    ),
                    ...department
                }
            );

        });


        const departments =
            Array.from(departmentMap.values());


        // ===============================
        // POPULATE DEPARTMENT DROPDOWN
        // ===============================

        const departmentSelect =
            document.getElementById("department");


        departmentSelect.innerHTML =
            '<option value="">Select Department</option>';


        departments.forEach(department => {

            const option =
                document.createElement("option");

            option.value =
                department.departmentName;

            option.textContent =
                department.departmentName;

            departmentSelect.appendChild(option);

        });


        // ===============================
        // LOAD EMPLOYEES
        // ===============================

        const employeeResponse =
            await fetch("data/employees.json");

        if (!employeeResponse.ok) {
            throw new Error("Unable to load employees.");
        }

        const employeesFromJSON =
            await employeeResponse.json();


        const savedEmployees =
            JSON.parse(
                localStorage.getItem("employees")
            ) || [];


        // Merge JSON employees and localStorage employees

        const employeeMap = new Map();


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


        existingEmployees =
            Array.from(employeeMap.values());


        // ===============================
        // POPULATE MANAGER DROPDOWN
        // ===============================

        const managerSelect =
            document.getElementById("manager");


        managerSelect.innerHTML =
            '<option value="">Select Manager</option>';


        existingEmployees.forEach(employee => {

            const fullName =
                `${employee.firstName || ""} ${employee.lastName || ""}`
                    .trim();


            if (!fullName) {
                return;
            }


            const option =
                document.createElement("option");


            option.value = fullName;

            option.textContent = fullName;


            managerSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Error loading form data:",
            error
        );

        alert(
            "Unable to load department or employee information. Please try again."
        );

    }

}


// ===============================
// LOAD FORM DATA
// ===============================

loadDepartments();


// ===============================
// EMPLOYEE FORM
// ===============================

const employeeForm =
    document.getElementById("employeeForm");


employeeForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ===============================
        // GET FORM VALUES
        // ===============================

        const employeeId =
            document.getElementById(
                "employeeId"
            ).value.trim();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const department =
            document.getElementById(
                "department"
            ).value;


        const manager =
            document.getElementById(
                "manager"
            ).value;


        const designation =
            document.getElementById(
                "designation"
            ).value.trim();


        const joiningDate =
            document.getElementById(
                "joiningDate"
            ).value;


        const status =
            document.getElementById(
                "status"
            ).value;


        // ===============================
        // REQUIRED FIELD VALIDATION
        // ===============================

        if (!employeeForm.checkValidity()) {

            employeeForm.reportValidity();

            return;

        }


        // ===============================
        // CHECK DUPLICATE EMPLOYEE ID
        // ===============================

        const employeeIdExists =
            existingEmployees.some(employee =>

                employee.employeeId &&
                employee.employeeId.toLowerCase() ===
                employeeId.toLowerCase()

            );


        if (employeeIdExists) {

            alert(
                "This Employee ID already exists."
            );

            document.getElementById(
                "employeeId"
            ).focus();

            return;

        }


        // ===============================
        // CHECK DUPLICATE EMAIL
        // ===============================

        const emailExists =
            existingEmployees.some(employee =>

                employee.email &&
                employee.email.toLowerCase() ===
                email.toLowerCase()

            );


        if (emailExists) {

            alert(
                "This email address is already registered."
            );

            document.getElementById(
                "email"
            ).focus();

            return;

        }


        // ===============================
        // CREATE EMPLOYEE
        // ===============================

        const newEmployee = {

            employeeId: employeeId,

            email: email,

            department: department,

            manager: manager,

            designation: designation,

            joiningDate: joiningDate,

            status: status,

            role: "Employee",

            firstLogin: true

        };


        // ===============================
        // SAVE EMPLOYEE
        // ===============================

        const savedEmployees =
            JSON.parse(
                localStorage.getItem("employees")
            ) || [];


        savedEmployees.push(newEmployee);


        localStorage.setItem(
            "employees",
            JSON.stringify(savedEmployees)
        );


        // ===============================
        // CREATE DEFAULT PASSWORD
        // ===============================

        const employeePasswords =
            JSON.parse(
                localStorage.getItem(
                    "employeePasswords"
                )
            ) || {};


        employeePasswords[employeeId] =
            "employee123";


        localStorage.setItem(
            "employeePasswords",
            JSON.stringify(employeePasswords)
        );


        // ===============================
        // SUCCESS
        // ===============================

        alert(
            "Employee added successfully!\n\n" +
            "Default password: employee123"
        );


        window.location.href =
            "employees.html";

    }

);