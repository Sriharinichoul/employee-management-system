
let employees = [];
let departments = [];
let selectedEmployee = null;

// ==================================================
// HELPERS
// ==================================================

function readLocalStorage(key, fallback = []) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return fallback;
    }
}

function normalizeId(value) {
    return String(value || "").trim().toLowerCase();
}

function updateStatusColor() {
    const statusSelect = document.getElementById("status");

    if (!statusSelect) return;

    statusSelect.classList.remove(
        "status-active",
        "status-inactive"
    );

    if (statusSelect.value.toLowerCase() === "active") {
        statusSelect.classList.add("status-active");
    } else if (statusSelect.value.toLowerCase() === "inactive") {
        statusSelect.classList.add("status-inactive");
    }
}

// ==================================================
// LOAD EMPLOYEES
// ==================================================

async function loadEmployees() {
    try {
        const response = await fetch("data/employees.json");

        if (!response.ok) {
            throw new Error("Could not load employees.json");
        }

        const jsonEmployees = await response.json();
        const savedEmployees = readLocalStorage("employees");

        employees = [...jsonEmployees];

        savedEmployees.forEach(savedEmployee => {
            const index = employees.findIndex(employee =>
                normalizeId(employee.employeeId) ===
                normalizeId(savedEmployee.employeeId)
            );

            if (index !== -1) {
                employees[index] = {
                    ...employees[index],
                    ...savedEmployee
                };
            } else {
                employees.push(savedEmployee);
            }
        });

        displayEmployees(employees);
        await loadDepartments();

    } catch (error) {
        console.error("Error loading employees:", error);

        employees = readLocalStorage("employees");
        displayEmployees(employees);

        await loadDepartments();
    }
}

// ==================================================
// DISPLAY EMPLOYEES
// ==================================================

function displayEmployees(employeeList) {
    const tableBody = document.getElementById("employeeTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!employeeList.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No employees found.
                </td>
            </tr>
        `;
        return;
    }

    employeeList.forEach(employee => {
        const row = document.createElement("tr");

        const status = employee.status || "-";
        const statusClass =
            status.toLowerCase() === "active"
                ? "status-active"
                : status.toLowerCase() === "inactive"
                    ? "status-inactive"
                    : "";

        row.innerHTML = `
            <td>${escapeHTML(employee.employeeId || "-")}</td>
            <td>${escapeHTML(employee.email || "-")}</td>
            <td>${escapeHTML(employee.department || "-")}</td>
            <td>${escapeHTML(employee.designation || "-")}</td>
            <td>${escapeHTML(employee.joiningDate || "-")}</td>
            <td>
                <span class="${statusClass}">
                    ${escapeHTML(status)}
                </span>
            </td>
            <td>
                <button
                    type="button"
                    class="edit-button"
                    data-employee-id="${escapeHTML(employee.employeeId || "")}"
                >
                    Edit
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    tableBody.querySelectorAll(".edit-button").forEach(button => {
        button.addEventListener("click", () => {
            openEditForm(button.dataset.employeeId);
        });
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// ==================================================
// LOAD DEPARTMENTS
// ==================================================

async function loadDepartments() {
    try {
        const response = await fetch("data/departments.json");

        if (!response.ok) {
            throw new Error("Could not load departments.json");
        }

        const jsonDepartments = await response.json();
        const savedDepartments = readLocalStorage("departments");

        departments = [...jsonDepartments];

        savedDepartments.forEach(savedDepartment => {
            const index = departments.findIndex(department =>
                normalizeId(department.departmentId) ===
                normalizeId(savedDepartment.departmentId)
            );

            if (index !== -1) {
                departments[index] = {
                    ...departments[index],
                    ...savedDepartment
                };
            } else {
                departments.push(savedDepartment);
            }
        });

    } catch (error) {
        console.error("Error loading departments:", error);
        departments = readLocalStorage("departments");
    }

    populateDepartmentDropdown();
}

// ==================================================
// DEPARTMENT DROPDOWN
// ==================================================

function populateDepartmentDropdown(selectedDepartment = "") {
    const departmentSelect = document.getElementById("department");

    if (!departmentSelect) return;

    departmentSelect.innerHTML = `
        <option value="">Select Department</option>
    `;

    departments.forEach(department => {
        const option = document.createElement("option");

        option.value = department.departmentName;
        option.textContent = department.departmentName;

        departmentSelect.appendChild(option);
    });

    departmentSelect.value = selectedDepartment;
}

// ==================================================
// MANAGER DROPDOWN
// ==================================================

function populateManagerDropdown(
    departmentName,
    selectedManager = ""
) {
    const managerSelect = document.getElementById("manager");

    if (!managerSelect) return;

    managerSelect.innerHTML = `
        <option value="">Select Manager</option>
    `;

    const department = departments.find(item =>
        item.departmentName === departmentName
    );

    if (!department || !department.manager) return;

    const option = document.createElement("option");

    option.value = department.manager;
    option.textContent = department.manager;

    managerSelect.appendChild(option);
    managerSelect.value = selectedManager;
}

// ==================================================
// OPEN EDIT FORM
// ==================================================

function openEditForm(employeeId) {
    selectedEmployee = employees.find(employee =>
        normalizeId(employee.employeeId) === normalizeId(employeeId)
    );

    if (!selectedEmployee) {
        alert("Employee not found.");
        return;
    }

    document.getElementById("employeeId").value =
        selectedEmployee.employeeId || "";

    document.getElementById("email").value =
        selectedEmployee.email || "";

    document.getElementById("designation").value =
        selectedEmployee.designation || "";

    document.getElementById("joiningDate").value =
        selectedEmployee.joiningDate || "";

    document.getElementById("status").value =
        selectedEmployee.status || "Active";

    populateDepartmentDropdown(
        selectedEmployee.department || ""
    );

    populateManagerDropdown(
        selectedEmployee.department || "",
        selectedEmployee.manager || ""
    );

    updateStatusColor();

    const formContainer =
        document.getElementById("editFormContainer");

    formContainer.classList.add("show");

    formContainer.scrollIntoView({
        behavior: "smooth"
    });
}

// ==================================================
// SEARCH EMPLOYEES
// ==================================================

const employeeSearch = document.getElementById("employeeSearch");

if (employeeSearch) {
    employeeSearch.addEventListener("input", function () {
        const searchText = this.value.toLowerCase().trim();

        const filteredEmployees = employees.filter(employee => {
            const employeeId =
                String(employee.employeeId || "").toLowerCase();

            const email =
                String(employee.email || "").toLowerCase();

            return (
                employeeId.includes(searchText) ||
                email.includes(searchText)
            );
        });

        displayEmployees(filteredEmployees);
    });
}

// ==================================================
// DEPARTMENT CHANGE
// ==================================================

const departmentSelect = document.getElementById("department");

if (departmentSelect) {
    departmentSelect.addEventListener("change", function () {
        populateManagerDropdown(this.value);
    });
}

// ==================================================
// STATUS CHANGE
// ==================================================

const statusSelect = document.getElementById("status");

if (statusSelect) {
    statusSelect.addEventListener("change", updateStatusColor);
    updateStatusColor();
}

// ==================================================
// UPDATE EMPLOYEE
// ==================================================

const employeeForm = document.getElementById("employeeForm");

if (employeeForm) {
    employeeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!selectedEmployee) {
            alert("Please select an employee first.");
            return;
        }

        const employeeId = selectedEmployee.employeeId;

        const updatedEmployee = {
            ...selectedEmployee,

            email: document.getElementById("email").value.trim(),

            department: document.getElementById("department").value,

            manager: document.getElementById("manager").value,

            designation: document.getElementById("designation").value.trim(),

            joiningDate: document.getElementById("joiningDate").value,

            status: document.getElementById("status").value
        };

        const savedEmployees = readLocalStorage("employees");

        const existingIndex = savedEmployees.findIndex(employee =>
            normalizeId(employee.employeeId) === normalizeId(employeeId)
        );

        if (existingIndex !== -1) {
            savedEmployees[existingIndex] = {
                ...savedEmployees[existingIndex],
                ...updatedEmployee
            };
        } else {
            savedEmployees.push(updatedEmployee);
        }

        localStorage.setItem(
            "employees",
            JSON.stringify(savedEmployees)
        );

        employees = employees.map(employee =>
            normalizeId(employee.employeeId) === normalizeId(employeeId)
                ? updatedEmployee
                : employee
        );

        displayEmployees(employees);

        alert("Employee updated successfully!");

        document
            .getElementById("editFormContainer")
            .classList.remove("show");

        selectedEmployee = null;
    });
}

// ==================================================
// CANCEL EDIT
// ==================================================

const cancelButton = document.getElementById("cancelEdit");

if (cancelButton) {
    cancelButton.addEventListener("click", function () {
        document
            .getElementById("editFormContainer")
            .classList.remove("show");

        selectedEmployee = null;
    });
}

// ==================================================
// START APPLICATION
// ==================================================

loadEmployees();
