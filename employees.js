
let employees = [];
let departments = [];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getLocalStorageData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return [];
    }
}

function normalizeId(id) {
    return String(id || "").trim().toLowerCase();
}

function getEmployeeName(employee) {
    const fullName =
        `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

    return fullName || employee.name || "";
}

// ==========================================
// LOAD EMPLOYEES
// ==========================================

async function loadEmployees() {
    const tableBody = document.getElementById("employeeTableBody");

    try {
        const response = await fetch("data/employees.json");

        if (!response.ok) {
            throw new Error("Unable to load employees.json");
        }

        const employeesFromJSON = await response.json();
        const savedEmployees = getLocalStorageData("employees");

        const employeeMap = new Map();

        employeesFromJSON.forEach(employee => {
            const id = normalizeId(employee.employeeId);

            if (id) {
                employeeMap.set(id, employee);
            }
        });

        savedEmployees.forEach(employee => {
            const id = normalizeId(employee.employeeId);

            if (id) {
                employeeMap.set(id, {
                    ...employeeMap.get(id),
                    ...employee
                });
            }
        });

        employees = Array.from(employeeMap.values());

        populateDepartmentFilter();
        applyEmployeeFilters();

    } catch (error) {
        console.error("Error loading employees:", error);

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Unable to load employees. Check the browser console.
                    </td>
                </tr>
            `;
        }
    }
}

// ==========================================
// LOAD DEPARTMENTS
// ==========================================

async function loadDepartments() {
    try {
        const response = await fetch("data/departments.json");

        if (!response.ok) {
            throw new Error("Unable to load departments.json");
        }

        const departmentsFromJSON = await response.json();
        const savedDepartments = getLocalStorageData("departments");

        const departmentMap = new Map();

        departmentsFromJSON.forEach(department => {
            const id = normalizeId(department.departmentId);

            if (id) {
                departmentMap.set(id, department);
            }
        });

        savedDepartments.forEach(department => {
            const id = normalizeId(department.departmentId);

            if (id) {
                departmentMap.set(id, {
                    ...departmentMap.get(id),
                    ...department
                });
            }
        });

        departments = Array.from(departmentMap.values());

        populateDepartmentFilter();

    } catch (error) {
        console.error("Error loading departments:", error);
    }
}

// ==========================================
// POPULATE DEPARTMENT FILTER
// ==========================================

function populateDepartmentFilter() {
    const departmentFilter =
        document.getElementById("departmentFilter");

    if (!departmentFilter) return;

    const selectedValue = departmentFilter.value;

    departmentFilter.innerHTML = `
        <option value="">All Departments</option>
    `;

    const departmentNames = new Set();

    departments.forEach(department => {
        if (department.departmentName) {
            departmentNames.add(department.departmentName);
        }
    });

    employees.forEach(employee => {
        if (employee.department) {
            departmentNames.add(employee.department);
        }
    });

    Array.from(departmentNames)
        .sort((a, b) => a.localeCompare(b))
        .forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            departmentFilter.appendChild(option);
        });

    if (departmentNames.has(selectedValue)) {
        departmentFilter.value = selectedValue;
    }
}

// ==========================================
// SORT EMPLOYEES
// ==========================================

function sortEmployees(employeeList) {
    const sortFilter = document.getElementById("sortFilter");
    const sortValue = sortFilter ? sortFilter.value : "";

    // Create a copy so the original employee list stays unchanged.
    const sortedEmployees = [...employeeList];

    switch (sortValue) {

        case "name-asc":
            sortedEmployees.sort((a, b) =>
                getEmployeeName(a).localeCompare(
                    getEmployeeName(b),
                    undefined,
                    { sensitivity: "base", numeric: true }
                )
            );
            break;

        case "name-desc":
            sortedEmployees.sort((a, b) =>
                getEmployeeName(b).localeCompare(
                    getEmployeeName(a),
                    undefined,
                    { sensitivity: "base", numeric: true }
                )
            );
            break;

        case "id-asc":
            sortedEmployees.sort((a, b) =>
                String(a.employeeId || "").localeCompare(
                    String(b.employeeId || ""),
                    undefined,
                    { numeric: true, sensitivity: "base" }
                )
            );
            break;

        case "id-desc":
            sortedEmployees.sort((a, b) =>
                String(b.employeeId || "").localeCompare(
                    String(a.employeeId || ""),
                    undefined,
                    { numeric: true, sensitivity: "base" }
                )
            );
            break;
    }

    return sortedEmployees;
}

// ==========================================
// DISPLAY EMPLOYEES
// ==========================================

function displayEmployees(employeeList) {
    const tableBody =
        document.getElementById("employeeTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (employeeList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No employees found.
                </td>
            </tr>
        `;
        return;
    }

    employeeList.forEach(employee => {
        const row = document.createElement("tr");

        const values = [
            employee.employeeId || "-",
            getEmployeeName(employee) || "-",
            employee.email || "-",
            employee.department || "-",
            employee.designation || "-",
            employee.joiningDate || "-"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Status
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        const status = employee.status || "-";

        statusBadge.textContent = status;

        if (status.toLowerCase() === "active") {
            statusBadge.className = "status-active";
        } else if (status.toLowerCase() === "inactive") {
            statusBadge.className = "status-inactive";
        }

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Edit action
        const actionCell = document.createElement("td");
        const editLink = document.createElement("a");

        editLink.textContent = "Edit";
        editLink.href =
            `edit-employee.html?id=${encodeURIComponent(employee.employeeId || "")}`;

        actionCell.appendChild(editLink);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

// ==========================================
// APPLY SEARCH, FILTERS AND SORTING
// ==========================================

function applyEmployeeFilters() {
    const searchInput =
        document.getElementById("employeeSearch");

    const departmentFilter =
        document.getElementById("departmentFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const searchText =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const selectedDepartment =
        departmentFilter ? departmentFilter.value : "";

    const selectedStatus =
        statusFilter ? statusFilter.value.toLowerCase() : "";

    const filteredEmployees = employees.filter(employee => {
        const employeeId =
            String(employee.employeeId || "").toLowerCase();

        const email =
            String(employee.email || "").toLowerCase();

        const fullName =
            getEmployeeName(employee).toLowerCase();

        const department =
            String(employee.department || "");

        const status =
            String(employee.status || "").toLowerCase();

        const matchesSearch =
            employeeId.includes(searchText) ||
            email.includes(searchText) ||
            fullName.includes(searchText);

        const matchesDepartment =
            selectedDepartment === "" ||
            department === selectedDepartment;

        const matchesStatus =
            selectedStatus === "" ||
            status === selectedStatus;

        return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
        );
    });

    const sortedEmployees = sortEmployees(filteredEmployees);

    displayEmployees(sortedEmployees);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

const employeeSearch =
    document.getElementById("employeeSearch");

const departmentFilter =
    document.getElementById("departmentFilter");

const statusFilter =
    document.getElementById("statusFilter");

const sortFilter =
    document.getElementById("sortFilter");

if (employeeSearch) {
    employeeSearch.addEventListener(
        "input",
        applyEmployeeFilters
    );
}

if (departmentFilter) {
    departmentFilter.addEventListener(
        "change",
        applyEmployeeFilters
    );
}

if (statusFilter) {
    statusFilter.addEventListener(
        "change",
        applyEmployeeFilters
    );
}

if (sortFilter) {
    sortFilter.addEventListener(
        "change",
        applyEmployeeFilters
    );
}

// ==========================================
// INITIALIZE
// ==========================================

async function initializeEmployeePage() {
    await Promise.all([
        loadEmployees(),
        loadDepartments()
    ]);

    populateDepartmentFilter();
    applyEmployeeFilters();
}

initializeEmployeePage();
