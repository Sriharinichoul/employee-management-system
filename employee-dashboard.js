
let employees = [];
let departments = [];
let currentEmployee = null;

// ==================================================
// HELPERS
// ==================================================

function getLocalStorageData(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return fallback;
    }
}

function normalizeId(value) {
    return String(value || "").trim().toLowerCase();
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// ==================================================
// LOAD EMPLOYEES
// ==================================================

async function loadEmployees() {
    try {
        const response = await fetch("data/employees.json");

        if (!response.ok) {
            throw new Error("Unable to load employee data.");
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

        const currentEmployeeId =
            localStorage.getItem("currentEmployeeId") || "EMP001";

        currentEmployee = employees.find(employee =>
            normalizeId(employee.employeeId) ===
            normalizeId(currentEmployeeId)
        );

        if (!currentEmployee) {
            alert("Employee information could not be found.");
            return;
        }

        displayCurrentEmployee();

        await displayEmployeeDocuments();
        await loadDepartments();

    } catch (error) {
        console.error("Error loading employees:", error);
        alert("Unable to load employee information.");
    }
}

// ==================================================
// DISPLAY CURRENT EMPLOYEE
// ==================================================

function displayCurrentEmployee() {
    if (!currentEmployee) return;

    const firstName = currentEmployee.firstName || "";
    const lastName = currentEmployee.lastName || "";

    const displayName =
        `${firstName} ${lastName}`.trim() ||
        currentEmployee.employeeId;

    const headerName = document.getElementById("headerEmployeeName");
    const welcomeMessage = document.getElementById("welcomeMessage");

    if (headerName) {
        headerName.textContent = displayName;
    }

    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${displayName}`;
    }

    const employeeFields = {
        employeeId: currentEmployee.employeeId,
        employeeEmail: currentEmployee.email,
        employeeDepartment: currentEmployee.department,
        employeeManager: currentEmployee.manager,
        employeeDesignation: currentEmployee.designation,
        employeeJoiningDate: currentEmployee.joiningDate,
        employeeStatus: currentEmployee.status
    };

    Object.entries(employeeFields).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value || "-";
        }
    });

    const statusElement = document.getElementById("employeeStatus");

    if (statusElement) {
        statusElement.classList.remove(
            "status-active",
            "status-inactive"
        );

        if (String(currentEmployee.status).toLowerCase() === "active") {
            statusElement.classList.add("status-active");
        } else if (
            String(currentEmployee.status).toLowerCase() === "inactive"
        ) {
            statusElement.classList.add("status-inactive");
        }
    }
}

// ==================================================
// DOCUMENT BUTTONS
// ==================================================

function createDocumentViewButton(employeeId, documentType) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "document-icon-button";
    button.title = "View document";
    button.setAttribute("aria-label", "View document");

    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round"
             aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    `;

    button.addEventListener("click", () => {
        if (typeof window.viewEmployeeDocument === "function") {
            window.viewEmployeeDocument(employeeId, documentType);
        } else {
            alert("Document viewing is unavailable.");
        }
    });

    return button;
}

function createDocumentDownloadButton(employeeId, documentType) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "document-icon-button";
    button.title = "Download document";
    button.setAttribute("aria-label", "Download document");

    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round"
             aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <path d="m7 10 5 5 5-5"/>
            <path d="M12 15V3"/>
        </svg>
    `;

    button.addEventListener("click", () => {
        if (typeof window.downloadEmployeeDocument === "function") {
            window.downloadEmployeeDocument(employeeId, documentType);
        } else {
            alert("Document downloading is unavailable.");
        }
    });

    return button;
}

// ==================================================
// DISPLAY EMPLOYEE DOCUMENTS
// ==================================================

async function displayEmployeeDocuments() {
    const documentsContainer =
        document.getElementById("myDocumentsList");

    if (!documentsContainer || !currentEmployee) return;

    documentsContainer.innerHTML = "";

    const documentTypes = [
        {
            type: "passportPhoto",
            label: "Passport Size Photo"
        },
        {
            type: "aadhaarDocument",
            label: "Aadhaar Document"
        },
        {
            type: "panDocument",
            label: "PAN Document"
        }
    ];

    for (const documentInfo of documentTypes) {
        const documentRow = document.createElement("div");

        documentRow.className =
            "document-item employee-document-row";

        const documentTitle = document.createElement("strong");

        documentTitle.className = "employee-document-label";
        documentTitle.textContent = documentInfo.label;

        const fileName = document.createElement("span");

        fileName.className =
            "document-filename employee-document-status";

        fileName.textContent = "Checking...";

        documentRow.appendChild(documentTitle);
        documentRow.appendChild(fileName);

        documentsContainer.appendChild(documentRow);

        try {
            if (
                typeof window.getEmployeeDocumentFromDB !== "function"
            ) {
                fileName.textContent = "Document storage unavailable";
                continue;
            }

            const documentRecord =
                await window.getEmployeeDocumentFromDB(
                    currentEmployee.employeeId,
                    documentInfo.type
                );

            if (
                !documentRecord ||
                !documentRecord.blob ||
                documentRecord.blob.size === 0
            ) {
                fileName.textContent = "Not uploaded";
                fileName.classList.add("not-uploaded");
                continue;
            }

            fileName.textContent =
                documentRecord.fileName || "Uploaded document";

            fileName.title =
                documentRecord.fileName || "Uploaded document";

            fileName.classList.add("uploaded");

            documentRow.appendChild(
                createDocumentViewButton(
                    currentEmployee.employeeId,
                    documentInfo.type
                )
            );

            documentRow.appendChild(
                createDocumentDownloadButton(
                    currentEmployee.employeeId,
                    documentInfo.type
                )
            );

        } catch (error) {
            console.error(
                `Error loading ${documentInfo.label}:`,
                error
            );

            fileName.textContent = "Unable to load document";
        }
    }
}

// ==================================================
// LOAD DEPARTMENTS
// ==================================================

async function loadDepartments() {
    try {
        const response = await fetch("data/departments.json");

        if (!response.ok) {
            throw new Error("Unable to load departments.");
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

    } catch (error) {
        console.error("Error loading departments:", error);
        departments = getLocalStorageData("departments");
    }
}

// ==================================================
// SEARCH EMPLOYEES
// ==================================================

const employeeSearch = document.getElementById("employeeSearch");

if (employeeSearch) {
    employeeSearch.addEventListener("input", function () {
        const searchText = this.value.toLowerCase().trim();

        const resultsContainer =
            document.getElementById("employeeSearchResults");

        const selectedEmployeeContainer =
            document.getElementById("selectedEmployee");

        if (!resultsContainer || !selectedEmployeeContainer) return;

        resultsContainer.innerHTML = "";
        selectedEmployeeContainer.innerHTML = "";

        if (!searchText) return;

        const results = employees.filter(employee => {
            const employeeId =
                String(employee.employeeId || "").toLowerCase();

            const email =
                String(employee.email || "").toLowerCase();

            const fullName =
                `${employee.firstName || ""} ${employee.lastName || ""}`
                    .toLowerCase();

            return (
                employeeId.includes(searchText) ||
                email.includes(searchText) ||
                fullName.includes(searchText)
            );
        });

        if (results.length === 0) {
            const noResult = document.createElement("div");

            noResult.className = "employee-search-result";
            noResult.textContent = "No employee found.";

            resultsContainer.appendChild(noResult);
            return;
        }

        results.forEach(employee => {
            const result = document.createElement("div");

            result.className = "employee-search-result";

            const fullName =
                `${employee.firstName || ""} ${employee.lastName || ""}`
                    .trim();

            const nameElement = document.createElement("strong");
            nameElement.textContent =
                fullName || employee.employeeId || "Employee";

            const idElement = document.createElement("span");
            idElement.textContent = employee.employeeId || "";

            result.appendChild(nameElement);
            result.appendChild(idElement);

            result.addEventListener("click", () => {
                showEmployeeDetails(employee);
            });

            resultsContainer.appendChild(result);
        });
    });
}

// ==================================================
// SHOW EMPLOYEE INFORMATION
// ==================================================

function showEmployeeDetails(employee) {
    const selectedEmployeeContainer =
        document.getElementById("selectedEmployee");

    const resultsContainer =
        document.getElementById("employeeSearchResults");

    if (!selectedEmployeeContainer) return;

    selectedEmployeeContainer.innerHTML = "";

    const fullName =
        `${employee.firstName || ""} ${employee.lastName || ""}`
            .trim();

    const heading = document.createElement("h3");

    heading.textContent =
        fullName || employee.employeeId || "Employee";

    selectedEmployeeContainer.appendChild(heading);

    const fields = [
        ["Department", employee.department],
        ["Manager", employee.manager],
        ["Designation", employee.designation]
    ];

    fields.forEach(([label, value]) => {
        const paragraph = document.createElement("p");

        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;

        paragraph.appendChild(strong);
        paragraph.appendChild(
            document.createTextNode(value || "-")
        );

        selectedEmployeeContainer.appendChild(paragraph);
    });

    if (resultsContainer) {
        resultsContainer.innerHTML = "";
    }
}

// ==================================================
// SEARCH DEPARTMENTS
// ==================================================

const departmentSearch =
    document.getElementById("departmentSearch");

if (departmentSearch) {
    departmentSearch.addEventListener("input", function () {
        const searchText = this.value.toLowerCase().trim();

        const resultsContainer =
            document.getElementById("departmentSearchResults");

        if (!resultsContainer) return;

        resultsContainer.innerHTML = "";

        if (!searchText) return;

        const results = departments.filter(department =>
            String(department.departmentName || "")
                .toLowerCase()
                .includes(searchText)
        );

        if (results.length === 0) {
            const noResult = document.createElement("div");

            noResult.className = "department-search-result";
            noResult.textContent = "No department found.";

            resultsContainer.appendChild(noResult);
            return;
        }

        results.forEach(department => {
            const result = document.createElement("div");

            result.className = "department-search-result";

            const departmentName = document.createElement("strong");
            departmentName.textContent =
                department.departmentName || "-";

            const managerName = document.createElement("span");
            managerName.textContent =
                `Manager: ${department.manager || "-"}`;

            result.appendChild(departmentName);
            result.appendChild(managerName);

            resultsContainer.appendChild(result);
        });
    });
}

// ==================================================
// LOGOUT
// ==================================================

const employeeLogout =
    document.getElementById("employeeLogout");

if (employeeLogout) {
    employeeLogout.addEventListener("click", function (event) {
        event.preventDefault();

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (confirmLogout) {
            localStorage.removeItem("currentEmployeeId");
            localStorage.removeItem("loggedInRole");

            window.location.href = "index.html";
        }
    });
}

// ==================================================
// START APPLICATION
// ==================================================

loadEmployees();
