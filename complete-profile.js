// ==================================================
// PROFILE FORM
// ==================================================

const profileForm =
    document.getElementById("completeProfileForm");


// ==================================================
// CURRENT EMPLOYEE
// ==================================================

const currentEmployeeId =
    localStorage.getItem("currentEmployeeId");


if (!currentEmployeeId) {

    window.location.href =
        "employee-login.html";

}


// ==================================================
// SET DATE OF BIRTH MAXIMUM DATE
// ==================================================

const dateOfBirthInput =
    document.getElementById("dateOfBirth");

const today =
    new Date().toISOString().split("T")[0];

dateOfBirthInput.max = today;


// ==================================================
// NUMBERS-ONLY INPUT
// ==================================================

function allowOnlyNumbers(inputId, maxLength) {

    const input =
        document.getElementById(inputId);

    input.addEventListener("input", function () {

        this.value =
            this.value.replace(/[^0-9]/g, "");

        if (this.value.length > maxLength) {

            this.value =
                this.value.slice(0, maxLength);

        }

    });

}


// Mobile number
allowOnlyNumbers("mobileNumber", 10);


// Emergency contact number
allowOnlyNumbers("emergencyContactNumber", 10);


// Postal code
allowOnlyNumbers("postalCode", 6);


// ==================================================
// LOAD EMPLOYEE
// ==================================================

let employees = [];


async function loadEmployee() {

    try {

        const response =
            await fetch("data/employees.json");

        if (!response.ok) {
            throw new Error("Unable to load employee data.");
        }


        const data =
            await response.json();


        const savedEmployees =
            JSON.parse(
                localStorage.getItem("employees")
            ) || [];


        // Merge JSON and localStorage employees

        const employeeMap = new Map();


        data.forEach(employee => {

            employeeMap.set(
                String(employee.employeeId).toLowerCase(),
                employee
            );

        });


        savedEmployees.forEach(savedEmployee => {

            const employeeId =
                String(savedEmployee.employeeId).toLowerCase();

            employeeMap.set(
                employeeId,
                {
                    ...employeeMap.get(employeeId),
                    ...savedEmployee
                }
            );

        });


        employees =
            Array.from(employeeMap.values());


        // Find current employee

        const employee =
            employees.find(employee =>

                String(employee.employeeId).toLowerCase() ===
                currentEmployeeId.toLowerCase()

            );


        if (!employee) {

            alert("Employee account not found.");

            localStorage.removeItem("currentEmployeeId");

            window.location.href =
                "employee-login.html";

            return;

        }


        // ==================================================
        // PRE-FILL EXISTING INFORMATION
        // ==================================================

        document.getElementById("firstName").value =
            employee.firstName || "";


        document.getElementById("lastName").value =
            employee.lastName || "";


        document.getElementById("dateOfBirth").value =
            employee.dateOfBirth || "";


        document.getElementById("mobileNumber").value =
            employee.mobileNumber || "";


        document.getElementById("bloodGroup").value =
            employee.bloodGroup || "";


        document.getElementById("address").value =
            employee.address || "";


        document.getElementById("city").value =
            employee.city || "";


        document.getElementById("state").value =
            employee.state || "";


        document.getElementById("postalCode").value =
            employee.postalCode || "";


        document.getElementById("emergencyContactName").value =
            employee.emergencyContactName || "";


        document.getElementById("emergencyContactNumber").value =
            employee.emergencyContactNumber || "";


        document.getElementById("emergencyContactRelationship").value =
            employee.emergencyContactRelationship || "";


    } catch (error) {

        console.error(
            "Error loading employee:",
            error
        );

        alert(
            "Unable to load employee information. Please try again."
        );

    }

}


// Load employee details

loadEmployee();


// ==================================================
// SAVE PROFILE
// ==================================================

profileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ==================================================
        // HTML FORM VALIDATION
        // ==================================================

        if (!profileForm.checkValidity()) {

            profileForm.reportValidity();

            return;

        }


        // ==================================================
        // ADDITIONAL DATE VALIDATION
        // ==================================================

        const dateOfBirth =
            document.getElementById("dateOfBirth").value;


        if (dateOfBirth > today) {

            alert("Date of birth cannot be in the future.");

            dateOfBirthInput.focus();

            return;

        }


        // ==================================================
        // MOBILE NUMBER VALIDATION
        // ==================================================

        const mobileNumber =
            document.getElementById("mobileNumber").value.trim();


        if (!/^[0-9]{10}$/.test(mobileNumber)) {

            alert("Mobile number must contain exactly 10 digits.");

            document.getElementById("mobileNumber").focus();

            return;

        }


        // ==================================================
        // EMERGENCY CONTACT VALIDATION
        // ==================================================

        const emergencyContactNumber =
            document.getElementById("emergencyContactNumber").value.trim();


        if (!/^[0-9]{10}$/.test(emergencyContactNumber)) {

            alert("Emergency contact number must contain exactly 10 digits.");

            document.getElementById("emergencyContactNumber").focus();

            return;

        }


        // ==================================================
        // POSTAL CODE VALIDATION
        // ==================================================

        const postalCode =
            document.getElementById("postalCode").value.trim();


        if (!/^[0-9]{6}$/.test(postalCode)) {

            alert("Postal code must contain exactly 6 digits.");

            document.getElementById("postalCode").focus();

            return;

        }


        // ==================================================
        // GET SAVED EMPLOYEES
        // ==================================================

        const savedEmployees =
            JSON.parse(
                localStorage.getItem("employees")
            ) || [];


        // Find current employee

        const employeeIndex =
            savedEmployees.findIndex(employee =>

                String(employee.employeeId).toLowerCase() ===
                currentEmployeeId.toLowerCase()

            );


        if (employeeIndex === -1) {

            alert("Employee account could not be found.");

            return;

        }


        const employee =
            savedEmployees[employeeIndex];


        // ==================================================
        // UPDATE PERSONAL INFORMATION
        // ==================================================

        employee.firstName =
            document.getElementById("firstName").value.trim();


        employee.lastName =
            document.getElementById("lastName").value.trim();


        employee.dateOfBirth =
            dateOfBirth;


        employee.mobileNumber =
            mobileNumber;


        employee.bloodGroup =
            document.getElementById("bloodGroup").value;


        employee.address =
            document.getElementById("address").value.trim();


        employee.city =
            document.getElementById("city").value.trim();


        employee.state =
            document.getElementById("state").value.trim();


        employee.postalCode =
            postalCode;


        employee.emergencyContactName =
            document.getElementById("emergencyContactName").value.trim();


        employee.emergencyContactNumber =
            emergencyContactNumber;


        employee.emergencyContactRelationship =
            document.getElementById("emergencyContactRelationship").value.trim();


        // ==================================================
        // FIRST LOGIN COMPLETED
        // ==================================================

        employee.firstLogin = false;


        // Update employee

        savedEmployees[employeeIndex] =
            employee;


        // ==================================================
        // SAVE TO LOCAL STORAGE
        // ==================================================

        localStorage.setItem(
            "employees",
            JSON.stringify(savedEmployees)
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        alert("Profile completed successfully!");


        window.location.href =
            "employee-dashboard.html";

    }

);


// ==================================================
// LOGOUT
// ==================================================

document
    .getElementById("profileLogout")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const confirmLogout =
                confirm("Are you sure you want to logout?");


            if (confirmLogout) {

                localStorage.removeItem("currentEmployeeId");

                localStorage.removeItem("loggedInRole");


                window.location.href =
                    "employee-login.html";

            }

        }
    );