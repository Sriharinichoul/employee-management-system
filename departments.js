
let departments = [];


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getSavedDepartments() {

    try {

        const saved = JSON.parse(
            localStorage.getItem("departments")
        );

        return Array.isArray(saved) ? saved : [];

    } catch (error) {

        console.error("Error reading saved departments:", error);

        return [];

    }

}


function normalizeDepartmentId(id) {

    return String(id || "").trim().toLowerCase();

}


// ==========================================
// LOAD DEPARTMENTS
// ==========================================

async function loadDepartments() {

    const tableBody =
        document.getElementById("departmentTableBody");

    try {

        const response = await fetch("data/departments.json");

        if (!response.ok) {

            throw new Error("Unable to load departments.json");

        }

        const departmentsFromJSON = await response.json();

        const savedDepartments = getSavedDepartments();

        const departmentMap = new Map();


        // Load original departments first

        departmentsFromJSON.forEach(department => {

            const id = normalizeDepartmentId(
                department.departmentId
            );

            if (id) {

                departmentMap.set(id, department);

            }

        });


        // Merge saved departments

        savedDepartments.forEach(department => {

            const id = normalizeDepartmentId(
                department.departmentId
            );

            if (!id) {

                return;

            }

            departmentMap.set(id, {

                ...departmentMap.get(id),

                ...department

            });

        });


        departments = Array.from(
            departmentMap.values()
        );


        // Display departments

        displayDepartments(departments);


    } catch (error) {

        console.error("Error loading departments:", error);

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Unable to load departments. Check the browser console.
                    </td>
                </tr>
            `;

        }

    }

}


// ==========================================
// DISPLAY DEPARTMENTS
// ==========================================

function displayDepartments(departmentList) {

    const tableBody =
        document.getElementById("departmentTableBody");

    if (!tableBody) {

        return;

    }

    tableBody.innerHTML = "";


    if (departmentList.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No departments found.
                </td>
            </tr>
        `;

        return;

    }


    departmentList.forEach(department => {

        const row = document.createElement("tr");

        const departmentId = department.departmentId || "-";

        const departmentName = department.departmentName || "-";

        const manager = department.manager || "-";

        const status = department.status || "-";


        // Department ID, Name and Manager

        [
            departmentId,
            departmentName,
            manager

        ].forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });


        // Status cell

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.textContent = status;

        statusBadge.className =
            status.toLowerCase() === "active"
                ? "status-active"
                : status.toLowerCase() === "inactive"
                    ? "status-inactive"
                    : "";

        statusCell.appendChild(statusBadge);

        row.appendChild(statusCell);


        // Edit action

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.className = "edit-button";

        editButton.textContent = "Edit";


        // Navigate to separate edit page

        editButton.addEventListener("click", function () {

            window.location.href =
                "edit-department.html?id=" +
                encodeURIComponent(departmentId);

        });


        actionCell.appendChild(editButton);

        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}


// ==========================================
// SEARCH DEPARTMENTS
// ==========================================

const searchDepartment =
    document.getElementById("searchDepartment");


if (searchDepartment) {

    searchDepartment.addEventListener("input", function () {

        const searchText =
            this.value.trim().toLowerCase();


        const filteredDepartments = departments.filter(department => {

            const name =
                String(department.departmentName || "").toLowerCase();

            const id =
                String(department.departmentId || "").toLowerCase();

            const manager =
                String(department.manager || "").toLowerCase();


            return (
                name.includes(searchText) ||
                id.includes(searchText) ||
                manager.includes(searchText)
            );

        });


        displayDepartments(filteredDepartments);

    });

}


// ==========================================
// INITIALIZE
// ==========================================

loadDepartments();
