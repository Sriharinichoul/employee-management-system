
let departments = [];
let selectedDepartment = null;


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

    try {

        const response = await fetch("data/departments.json");

        if (!response.ok) {
            throw new Error("Unable to load departments.");
        }

        const departmentsFromJSON = await response.json();

        const savedDepartments = getSavedDepartments();

        const departmentMap = new Map();


        // Load departments from JSON

        departmentsFromJSON.forEach(department => {

            const id = normalizeDepartmentId(
                department.departmentId
            );

            if (id) {
                departmentMap.set(id, department);
            }

        });


        // Merge localStorage departments

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


        // Get department ID from URL

        const urlParams = new URLSearchParams(
            window.location.search
        );

        const departmentId = urlParams.get("id");


        if (!departmentId) {

            alert("Department ID is missing.");

            window.location.href = "departments.html";

            return;

        }


        // Find selected department

        selectedDepartment = departments.find(department =>
            normalizeDepartmentId(department.departmentId) ===
            normalizeDepartmentId(departmentId)
        );


        if (!selectedDepartment) {

            alert("Department not found.");

            window.location.href = "departments.html";

            return;

        }


        // Populate form

        populateDepartmentForm();

    } catch (error) {

        console.error("Error loading departments:", error);

        alert("Unable to load department details.");

    }

}


// ==========================================
// POPULATE DEPARTMENT FORM
// ==========================================

function populateDepartmentForm() {

    document.getElementById("departmentId").value =
        selectedDepartment.departmentId || "";

    document.getElementById("departmentName").value =
        selectedDepartment.departmentName || "";

    document.getElementById("manager").value =
        selectedDepartment.manager || "";

    document.getElementById("status").value =
        selectedDepartment.status || "Active";


    // Apply status color

    updateStatusColor();

}


// ==========================================
// UPDATE STATUS COLOR
// ==========================================

const statusField = document.getElementById("status");


function updateStatusColor() {

    if (!statusField) {
        return;
    }

    statusField.classList.remove(
        "status-active",
        "status-inactive"
    );


    if (statusField.value === "Active") {

        statusField.classList.add("status-active");

    } else if (statusField.value === "Inactive") {

        statusField.classList.add("status-inactive");

    }

}


// Change color when status changes

if (statusField) {

    statusField.addEventListener(
        "change",
        updateStatusColor
    );

}


// ==========================================
// UPDATE DEPARTMENT
// ==========================================

document.getElementById("departmentForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (!selectedDepartment) {

            alert("Department not found.");

            return;

        }


        const updatedDepartment = {

            ...selectedDepartment,

            departmentId:
                selectedDepartment.departmentId,

            departmentName:
                selectedDepartment.departmentName,

            manager:
                document.getElementById("manager").value.trim(),

            status:
                document.getElementById("status").value

        };


        if (!updatedDepartment.manager) {

            alert("Please enter the department manager.");

            return;

        }


        // Get saved departments

        const savedDepartments = getSavedDepartments();


        // Find existing department

        const existingIndex = savedDepartments.findIndex(department =>
            normalizeDepartmentId(department.departmentId) ===
            normalizeDepartmentId(updatedDepartment.departmentId)
        );


        if (existingIndex !== -1) {

            savedDepartments[existingIndex] = updatedDepartment;

        } else {

            savedDepartments.push(updatedDepartment);

        }


        // Save updated departments

        localStorage.setItem(
            "departments",
            JSON.stringify(savedDepartments)
        );


        alert("Department updated successfully!");


        // Return to department list

        window.location.href = "departments.html";

    }

);


// ==========================================
// CANCEL EDIT
// ==========================================

document.getElementById("cancelDepartmentEdit").addEventListener(
    "click",
    function() {

        window.location.href = "departments.html";

    }

);


// ==========================================
// INITIALIZE
// ==========================================

loadDepartments();
