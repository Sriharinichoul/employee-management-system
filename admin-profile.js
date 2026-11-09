// ===============================
// DEFAULT ADMIN PROFILE
// ===============================

const defaultAdmin = {

    employeeId: "ADM001",

    firstName: "Admin",

    lastName: "User",

    email: "admin@company.com",

    role: "System Administrator",

    department: "Administration",

    dateOfBirth: "1995-01-15",

    phone: "9876500000",

    bloodGroup: "O+",

    address: "UBS Office",

    city: "Pune",

    state: "Maharashtra",

    postalCode: "411014",

    emergencyContactName: "Admin Emergency Contact",

    emergencyContactNumber: "9876500001",

    emergencyContactRelationship: "Family",

    status: "Active"

};


// ===============================
// LOAD SAVED ADMIN
// ===============================

const savedAdmin =
    JSON.parse(
        localStorage.getItem("adminProfile")
    ) || {};


// Merge saved values with defaults

let admin = {

    ...defaultAdmin,

    ...savedAdmin

};


// ===============================
// DISPLAY ADMIN PROFILE
// ===============================

function displayAdminProfile() {

    const fullName =
        `${admin.firstName || ""} ${admin.lastName || ""}`
            .trim();


    // Header

    const headerName =
        document.getElementById(
            "headerAdminName"
        );


    if (headerName) {

        headerName.textContent =
            fullName || "Admin";

    }


    // ===============================
    // ACCOUNT INFORMATION
    // ===============================

    document.getElementById(
        "employeeId"
    ).value =
        admin.employeeId || "";


    document.getElementById(
        "email"
    ).value =
        admin.email || "";


    document.getElementById(
        "role"
    ).value =
        admin.role || "";


    document.getElementById(
        "department"
    ).value =
        admin.department || "";


    // ===============================
    // PERSONAL INFORMATION
    // ===============================

    document.getElementById(
        "firstName"
    ).value =
        admin.firstName || "";


    document.getElementById(
        "lastName"
    ).value =
        admin.lastName || "";


    document.getElementById(
        "dateOfBirth"
    ).value =
        admin.dateOfBirth || "";


    document.getElementById(
        "phone"
    ).value =
        admin.phone || "";


    document.getElementById(
        "bloodGroup"
    ).value =
        admin.bloodGroup || "";


    // ===============================
    // ADDRESS
    // ===============================

    document.getElementById(
        "address"
    ).value =
        admin.address || "";


    document.getElementById(
        "city"
    ).value =
        admin.city || "";


    document.getElementById(
        "state"
    ).value =
        admin.state || "";


    document.getElementById(
        "postalCode"
    ).value =
        admin.postalCode || "";


    // ===============================
    // EMERGENCY CONTACT
    // ===============================

    document.getElementById(
        "emergencyContactName"
    ).value =
        admin.emergencyContactName || "";


    document.getElementById(
        "emergencyContactNumber"
    ).value =
        admin.emergencyContactNumber || "";


    document.getElementById(
        "emergencyContactRelationship"
    ).value =
        admin.emergencyContactRelationship || "";

}


// ===============================
// SAVE PROFILE
// ===============================

document
    .getElementById("adminProfileForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            admin = {

                ...admin,

                firstName:
                    document.getElementById(
                        "firstName"
                    ).value.trim(),

                lastName:
                    document.getElementById(
                        "lastName"
                    ).value.trim(),

                dateOfBirth:
                    document.getElementById(
                        "dateOfBirth"
                    ).value,

                phone:
                    document.getElementById(
                        "phone"
                    ).value.trim(),

                bloodGroup:
                    document.getElementById(
                        "bloodGroup"
                    ).value,

                address:
                    document.getElementById(
                        "address"
                    ).value.trim(),

                city:
                    document.getElementById(
                        "city"
                    ).value.trim(),

                state:
                    document.getElementById(
                        "state"
                    ).value.trim(),

                postalCode:
                    document.getElementById(
                        "postalCode"
                    ).value.trim(),

                emergencyContactName:
                    document.getElementById(
                        "emergencyContactName"
                    ).value.trim(),

                emergencyContactNumber:
                    document.getElementById(
                        "emergencyContactNumber"
                    ).value.trim(),

                emergencyContactRelationship:
                    document.getElementById(
                        "emergencyContactRelationship"
                    ).value.trim()

            };


            localStorage.setItem(
                "adminProfile",
                JSON.stringify(admin)
            );


            alert(
                "Profile updated successfully!"
            );


            displayAdminProfile();

        }
    );


// ===============================
// LOGOUT
// ===============================

document
    .getElementById("adminLogout")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                localStorage.removeItem(
                    "loggedInRole"
                );

                window.location.href =
                    "index.html";

            }

        }
    );


// ===============================
// INITIALIZE
// ===============================

displayAdminProfile();