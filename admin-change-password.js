// ===============================
// LOAD ADMIN PROFILE
// ===============================

const defaultAdmin = {

    employeeId: "ADM001",

    firstName: "Admin",

    lastName: "User",

    email: "admin@company.com"

};


const admin =
    JSON.parse(
        localStorage.getItem("adminProfile")
    ) || defaultAdmin;


// ===============================
// DISPLAY ADMIN NAME
// ===============================

const fullName =
    `${admin.firstName || ""} ${admin.lastName || ""}`.trim();


const headerName =
    document.getElementById("headerAdminName");


if (headerName) {

    headerName.textContent =
        fullName || "Admin";

}


// ===============================
// CHANGE ADMIN PASSWORD
// ===============================

document
    .getElementById("adminChangePasswordForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const currentPassword =
            document.getElementById("currentPassword").value;

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // ===============================
        // GET SAVED ADMIN PASSWORD
        // ===============================

        const savedPassword =
            JSON.parse(
                localStorage.getItem("adminPassword")
            );


        /*
         * If Admin has never changed the
         * password, use the default password.
         */

        const existingPassword =
            savedPassword || "admin123";


        // ===============================
        // VALIDATE CURRENT PASSWORD
        // ===============================

        if (currentPassword !== existingPassword) {

            alert("Current password is incorrect.");

            return;
        }


        // ===============================
        // VALIDATE NEW PASSWORD
        // ===============================

        if (newPassword.length < 8) {

            alert(
                "Password must contain at least 8 characters."
            );

            return;
        }


        // ===============================
        // CONFIRM PASSWORD
        // ===============================

        if (newPassword !== confirmPassword) {

            alert(
                "New password and confirm password do not match."
            );

            return;
        }


        // ===============================
        // CHECK SAME PASSWORD
        // ===============================

        if (newPassword === currentPassword) {

            alert(
                "New password must be different from the current password."
            );

            return;
        }


        // ===============================
        // SAVE NEW PASSWORD
        // ===============================

        localStorage.setItem(
            "adminPassword",
            JSON.stringify(newPassword)
        );


        alert("Password changed successfully!");


        // Clear form

        document
            .getElementById("adminChangePasswordForm")
            .reset();

    });


// ===============================
// LOGOUT
// ===============================

document
    .getElementById("adminLogout")
    .addEventListener("click", function (event) {

        event.preventDefault();


        const confirmLogout =
            confirm("Are you sure you want to logout?");


        if (confirmLogout) {

            localStorage.removeItem("loggedInRole");

            window.location.href = "index.html";

        }

    });