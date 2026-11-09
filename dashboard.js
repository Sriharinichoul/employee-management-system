
// ==================================================
// ADMIN ACCESS CHECK
// ==================================================

const loggedInRole = localStorage.getItem("loggedInRole");

if (loggedInRole !== "admin") {
    alert("Please login as an administrator.");
    window.location.href = "index.html";
}


// ==================================================
// GLOBAL DATA
// ==================================================

let employees = [];
let departments = [];


// ==================================================
// HELPER FUNCTIONS
// ==================================================

function getLocalStorageData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return [];
    }
}


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}


function getStatusClass(status) {
    return String(status).trim().toLowerCase() === "active"
        ? "status-active"
        : "status-inactive";
}


function getEmployeeName(employee) {
    return `${employee.firstName || ""} ${employee.lastName || ""}`.trim()
        || employee.employeeId
        || "Unknown Employee";
}


// ==================================================
// DISPLAY ADMIN NAME
// ==================================================

function displayAdminName() {
    let adminProfile;

    try {
        adminProfile = JSON.parse(localStorage.getItem("adminProfile"));
    } catch (error) {
        adminProfile = null;
    }

    const nameElement = document.getElementById("headerAdminName");

    if (nameElement) {
        const fullName = adminProfile &&
            `${adminProfile.firstName || ""} ${adminProfile.lastName || ""}`.trim();

        nameElement.textContent = fullName || "Admin";
    }
}


// ==================================================
// MERGE DATA WITHOUT DUPLICATES
// ==================================================

function mergeEmployees(jsonEmployees, savedEmployees) {
    const employeeMap = new Map();

    [...jsonEmployees, ...savedEmployees].forEach(employee => {
        const id = String(employee.employeeId || "").trim().toLowerCase();

        if (!id) return;

        employeeMap.set(id, {
            ...employeeMap.get(id),
            ...employee
        });
    });

    return Array.from(employeeMap.values());
}


function mergeDepartments(jsonDepartments, savedDepartments) {
    const departmentMap = new Map();

    [...jsonDepartments, ...savedDepartments].forEach(department => {
        const id = String(
            department.departmentId || department.departmentName || ""
        ).trim().toLowerCase();

        if (!id) return;

        departmentMap.set(id, {
            ...departmentMap.get(id),
            ...department
        });
    });

    return Array.from(departmentMap.values());
}


// ==================================================
// LOAD EMPLOYEES
// ==================================================

async function loadEmployees() {
    try {
        const response = await fetch("data/employees.json");

        if (!response.ok) {
            throw new Error("Unable to load employees.json");
        }

        const jsonEmployees = await response.json();

        employees = mergeEmployees(
            Array.isArray(jsonEmployees) ? jsonEmployees : [],
            getLocalStorageData("employees")
        );

        updateDashboardCounts();
        applyEmployeeFilters();

    } catch (error) {
        console.error("Employee loading error:", error);

        employees = getLocalStorageData("employees");

        updateDashboardCounts();
        applyEmployeeFilters();
    }
}


// ==================================================
// LOAD DEPARTMENTS
// ==================================================

async function loadDepartments() {
    try {
        const response = await fetch("data/departments.json");

        if (!response.ok) {
            throw new Error("Unable to load departments.json");
        }

        const jsonDepartments = await response.json();

        departments = mergeDepartments(
            Array.isArray(jsonDepartments) ? jsonDepartments : [],
            getLocalStorageData("departments")
        );

    } catch (error) {
        console.error("Department loading error:", error);

        departments = getLocalStorageData("departments");
    }

    displayDepartments();
    populateDepartmentFilter();
    updateDashboardCounts();
    applyEmployeeFilters();
}


// ==================================================
// UPDATE DASHBOARD COUNTS
// ==================================================

function updateDashboardCounts() {
    const totalEmployees = document.getElementById("totalEmployees");
    const totalDepartments = document.getElementById("totalDepartments");
    const activeEmployees = document.getElementById("activeEmployees");
    const inactiveEmployees = document.getElementById("inactiveEmployees");

    if (totalEmployees) {
        totalEmployees.textContent = employees.length;
    }

    if (totalDepartments) {
        totalDepartments.textContent = departments.length;
    }

    if (activeEmployees) {
        activeEmployees.textContent = employees.filter(employee =>
            String(employee.status || "").toLowerCase() === "active"
        ).length;
    }

    if (inactiveEmployees) {
        inactiveEmployees.textContent = employees.filter(employee =>
            String(employee.status || "").toLowerCase() === "inactive"
        ).length;
    }
}


// ==================================================
// DISPLAY DEPARTMENTS
// ==================================================

function displayDepartments() {
    const departmentContainer = document.getElementById("departmentList");

    if (!departmentContainer) return;

    departmentContainer.innerHTML = "";

    if (departments.length === 0) {
        departmentContainer.textContent = "No departments found.";
        return;
    }

    departments.forEach(department => {
        const item = document.createElement("div");
        item.className = "department-item";

        const name = document.createElement("strong");
        name.textContent = department.departmentName || "Unnamed Department";

        const manager = document.createElement("span");
        manager.textContent = `Manager: ${department.manager || "-"}`;

        item.appendChild(name);
        item.appendChild(manager);

        departmentContainer.appendChild(item);
    });
}


// ==================================================
// POPULATE DEPARTMENT FILTER
// ==================================================

function populateDepartmentFilter() {
    const departmentFilter = document.getElementById("departmentFilter");

    if (!departmentFilter) return;

    const selectedValue = departmentFilter.value;

    departmentFilter.innerHTML = `
        <option value="">All Departments</option>
    `;

    departments.forEach(department => {
        const departmentName = department.departmentName;

        if (!departmentName) return;

        const option = document.createElement("option");
        option.value = departmentName;
        option.textContent = departmentName;

        departmentFilter.appendChild(option);
    });

    departmentFilter.value = selectedValue;
}


// ==================================================
// EMPLOYEE FILTERING
// ==================================================

function applyEmployeeFilters() {
    const searchInput = document.getElementById("employeeSearch");
    const statusFilter = document.getElementById("statusFilter");
    const departmentFilter = document.getElementById("departmentFilter");

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = statusFilter
        ? statusFilter.value.toLowerCase()
        : "";

    const selectedDepartment = departmentFilter
        ? departmentFilter.value.toLowerCase()
        : "";

    const filteredEmployees = employees.filter(employee => {
        const employeeId = String(employee.employeeId || "").toLowerCase();
        const email = String(employee.email || "").toLowerCase();
        const fullName = getEmployeeName(employee).toLowerCase();

        const department = String(employee.department || "").toLowerCase();
        const status = String(employee.status || "").toLowerCase();

        const matchesSearch =
            employeeId.includes(searchTerm) ||
            email.includes(searchTerm) ||
            fullName.includes(searchTerm);

        const matchesStatus =
            !selectedStatus || status === selectedStatus;

        const matchesDepartment =
            !selectedDepartment || department === selectedDepartment;

        return matchesSearch && matchesStatus && matchesDepartment;
    });

    displayEmployees(filteredEmployees);
}


// ==================================================
// DISPLAY EMPLOYEES
// ==================================================

function displayEmployees(employeeList) {
    const tableBody = document.getElementById("employeeTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (employeeList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center;">
                    No employees found.
                </td>
            </tr>
        `;
        return;
    }

    employeeList.forEach(employee => {
        const row = document.createElement("tr");

        const status = employee.status || "Inactive";
        const statusClass = getStatusClass(status);

        row.innerHTML = `
            <td>${escapeHTML(employee.employeeId || "-")}</td>

            <td>${escapeHTML(getEmployeeName(employee))}</td>

            <td>${escapeHTML(employee.email || "-")}</td>

            <td>${escapeHTML(employee.department || "-")}</td>

            <td>${escapeHTML(employee.designation || "-")}</td>

            <td>${escapeHTML(employee.joiningDate || "-")}</td>

            <td>
                <span class="${statusClass}">
                    ${escapeHTML(status)}
                </span>
            </td>

            <td class="document-cell">Loading...</td>
            <td class="document-cell">Loading...</td>
            <td class="document-cell">Loading...</td>

            <td>
                <a
                    href="edit-employee.html?id=${encodeURIComponent(employee.employeeId || "")}"
                    class="edit-button"
                >
                    Edit
                </a>
            </td>
        `;

        tableBody.appendChild(row);

        displayEmployeeDocuments(row, employee);
    });
}


// ==================================================
// DISPLAY EMPLOYEE DOCUMENTS
// ==================================================

async function displayEmployeeDocuments(row, employee) {
    const documentTypes = [
        "passportPhoto",
        "aadhaarDocument",
        "panDocument"
    ];

    const cells = row.querySelectorAll(".document-cell");

    for (let index = 0; index < documentTypes.length; index++) {
        const documentType = documentTypes[index];
        const cell = cells[index];

        try {
            if (
                typeof window.getEmployeeDocumentFromDB !== "function"
            ) {
                cell.textContent = "Unavailable";
                continue;
            }

            const record = await window.getEmployeeDocumentFromDB(
                employee.employeeId,
                documentType
            );

            if (!record || !record.blob) {
                cell.textContent = "Not uploaded";
                continue;
            }

            const actions = document.createElement("div");
            actions.className = "document-actions document-icon-actions";

            const fileName = document.createElement("span");
            fileName.className = "document-filename";
            fileName.textContent = record.fileName || "Uploaded document";
            fileName.title = record.fileName || "Uploaded document";

            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "document-icon-button";
            viewButton.title = "View document";
            viewButton.setAttribute("aria-label", "View document");
            viewButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="21" height="21"
                    fill="none" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;

            const downloadButton = document.createElement("button");
            downloadButton.type = "button";
            downloadButton.className = "document-icon-button";
            downloadButton.title = "Download document";
            downloadButton.setAttribute("aria-label", "Download document");
            downloadButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="21" height="21"
                    fill="none" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <path d="m7 10 5 5 5-5"/>
                    <path d="M12 15V3"/>
                </svg>
            `;

            viewButton.addEventListener("click", () => {
                window.viewEmployeeDocument(
                    employee.employeeId,
                    documentType
                );
            });

            downloadButton.addEventListener("click", () => {
                window.downloadEmployeeDocument(
                    employee.employeeId,
                    documentType
                );
            });

            actions.appendChild(fileName);
            actions.appendChild(viewButton);
            actions.appendChild(downloadButton);

            cell.innerHTML = "";
            cell.appendChild(actions);

        } catch (error) {
            console.error(
                `Error loading ${documentType} for ${employee.employeeId}:`,
                error
            );

            cell.textContent = "Unavailable";
        }
    }
}


// ==================================================
// EMPLOYEE SEARCH RESULTS
// ==================================================

function displaySearchResults(results) {
    const container = document.getElementById("searchResults");

    if (!container) return;

    container.innerHTML = "";

    if (results.length === 0) {
        container.textContent = "No employees found.";
        return;
    }

    results.forEach(employee => {
        const result = document.createElement("div");
        result.className = "search-result";

        result.textContent =
            `${employee.employeeId} - ${getEmployeeName(employee)}`;

        result.addEventListener("click", () => {
            displayEmployeeDetails(employee);
        });

        container.appendChild(result);
    });
}


// ==================================================
// EMPLOYEE DETAILS
// ==================================================

function displayEmployeeDetails(employee) {
    const container = document.getElementById("employeeDetails");

    if (!container) return;

    container.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = getEmployeeName(employee);
    container.appendChild(heading);

    const fields = [
        ["Employee ID", employee.employeeId],
        ["Email", employee.email],
        ["Department", employee.department],
        ["Manager", employee.manager],
        ["Designation", employee.designation],
        ["Joining Date", employee.joiningDate],
        ["Status", employee.status]
    ];

    fields.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");

        strong.textContent = `${label}: `;

        paragraph.appendChild(strong);
        paragraph.appendChild(
            document.createTextNode(value || "-")
        );

        container.appendChild(paragraph);
    });

    container.style.display = "block";
}


// ==================================================
// EVENT LISTENERS
// ==================================================

const employeeSearch = document.getElementById("employeeSearch");
const statusFilter = document.getElementById("statusFilter");
const departmentFilter = document.getElementById("departmentFilter");

if (employeeSearch) {
    employeeSearch.addEventListener("input", applyEmployeeFilters);
}

if (statusFilter) {
    statusFilter.addEventListener("change", applyEmployeeFilters);
}

if (departmentFilter) {
    departmentFilter.addEventListener("change", applyEmployeeFilters);
}


// ==================================================
// LOGOUT
// ==================================================

const adminLogout = document.getElementById("adminLogout");

if (adminLogout) {
    adminLogout.addEventListener("click", event => {
        event.preventDefault();

        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("loggedInRole");
            window.location.href = "index.html";
        }
    });
}


// ==================================================
// INITIAL LOAD
// ==================================================

displayAdminName();

loadEmployees();
loadDepartments();
