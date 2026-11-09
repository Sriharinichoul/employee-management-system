// ==================================================
// CURRENT EMPLOYEE
// ==================================================

const currentEmployeeId =
    localStorage.getItem("currentEmployeeId");


if (!currentEmployeeId) {

    window.location.href = "index.html";

}


// ==================================================
// FORM ELEMENTS
// ==================================================

const profileForm =
    document.getElementById("profileForm");

const today =
    new Date().toISOString().split("T")[0];


// ==================================================
// DATE OF BIRTH VALIDATION
// ==================================================

const dateOfBirthInput =
    document.getElementById("dateOfBirth");

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


allowOnlyNumbers("phone", 10);

allowOnlyNumbers("emergencyContactNumber", 10);

allowOnlyNumbers("postalCode", 6);


// ==================================================
// LOAD EMPLOYEE DATA
// ==================================================

async function loadEmployee() {

    try {

        const response =
            await fetch("data/employees.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load employee data."
            );

        }


        const employeesFromJSON =
            await response.json();


        const savedEmployees =
            JSON.parse(
                localStorage.getItem("employees")
            ) || [];


        // Merge JSON and localStorage employees

        const employeeMap = new Map();


        employeesFromJSON.forEach(employee => {

            employeeMap.set(
                String(employee.employeeId).toLowerCase(),
                employee
            );

        });


        savedEmployees.forEach(employee => {

            const employeeId =
                String(employee.employeeId).toLowerCase();

            employeeMap.set(
                employeeId,
                {
                    ...employeeMap.get(employeeId),
                    ...employee
                }
            );

        });


        const employees =
            Array.from(employeeMap.values());


        // Find current employee

        const employee =
            employees.find(employee =>

                String(employee.employeeId).toLowerCase() ===
                currentEmployeeId.toLowerCase()

            );


        if (!employee) {

            alert(
                "Employee information could not be found."
            );

            window.location.href = "index.html";

            return null;

        }


        return employee;


    } catch (error) {

        console.error(
            "Error loading employee:",
            error
        );

        alert(
            "Unable to load employee information."
        );

        return null;

    }

}


// ==================================================
// DISPLAY EMPLOYEE PROFILE
// ==================================================

async function displayEmployeeProfile() {

    const employee =
        await loadEmployee();


    if (!employee) {

        return;

    }


    // Full name

    const fullName =
        `${employee.firstName || ""} ${employee.lastName || ""}`
            .trim();


    const headerName =
        document.getElementById("headerEmployeeName");


    if (headerName) {

        headerName.textContent =
            fullName || "Employee";

    }


    // Account information

    document.getElementById("employeeId").value =
        employee.employeeId || "";


    document.getElementById("email").value =
        employee.email || "";


    // Personal information

    document.getElementById("firstName").value =
        employee.firstName || "";


    document.getElementById("lastName").value =
        employee.lastName || "";


    document.getElementById("dateOfBirth").value =
        employee.dateOfBirth || "";


    document.getElementById("phone").value =
        employee.phone || employee.mobileNumber || "";


    document.getElementById("bloodGroup").value =
        employee.bloodGroup || "";


    // Address information

    document.getElementById("address").value =
        employee.address || "";


    document.getElementById("city").value =
        employee.city || "";


    document.getElementById("state").value =
        employee.state || "";


    document.getElementById("postalCode").value =
        employee.postalCode || "";


    // Emergency contact

    document.getElementById("emergencyContactName").value =
        employee.emergencyContactName || "";


    document.getElementById("emergencyContactNumber").value =
        employee.emergencyContactNumber || "";


    document.getElementById("emergencyContactRelationship").value =
        employee.emergencyContactRelationship || "";


    // Display uploaded documents

    await displayEmployeeDocuments();

}


// ==================================================
// DISPLAY UPLOADED DOCUMENTS
// ==================================================

async function displayEmployeeDocuments() {

    const documentTypes = [

        {
            type: "passportPhoto",
            inputId: "passportPhoto",
            statusId: "passportPhotoStatus",
            label: "Passport Size Photo"
        },

        {
            type: "aadhaarDocument",
            inputId: "aadhaarDocument",
            statusId: "aadhaarDocumentStatus",
            label: "Aadhaar Card"
        },

        {
            type: "panDocument",
            inputId: "panDocument",
            statusId: "panDocumentStatus",
            label: "PAN Card"
        }

    ];


    for (const documentInfo of documentTypes) {

        const statusElement =
            document.getElementById(
                documentInfo.statusId
            );


        if (!statusElement) {

            continue;

        }


        statusElement.innerHTML = "";


        try {

            const documentRecord =
                await window.getEmployeeDocumentFromDB(
                    currentEmployeeId,
                    documentInfo.type
                );


            if (!documentRecord) {

                statusElement.textContent =
                    "No document uploaded.";

                continue;

            }


            // Display file name

            const fileName =
                document.createElement("span");

            fileName.className =
                "uploaded-file-name";

            fileName.textContent =
                documentRecord.fileName;


            statusElement.appendChild(fileName);


            // View button

            const viewButton =
                document.createElement("button");

            viewButton.type = "button";

            viewButton.textContent = "View";

            viewButton.className =
                "document-action-button";


            viewButton.addEventListener(
                "click",
                async function () {

                    await window.viewEmployeeDocument(
                        currentEmployeeId,
                        documentInfo.type
                    );

                }
            );


            // Download button

            const downloadButton =
                document.createElement("button");

            downloadButton.type = "button";

            downloadButton.textContent = "Download";

            downloadButton.className =
                "document-action-button";


            downloadButton.addEventListener(
                "click",
                async function () {

                    await window.downloadEmployeeDocument(
                        currentEmployeeId,
                        documentInfo.type
                    );

                }
            );


            statusElement.appendChild(viewButton);

            statusElement.appendChild(downloadButton);


        } catch (error) {

            console.error(
                "Error displaying document:",
                error
            );

            statusElement.textContent =
                "Unable to load document.";

        }

    }

}


// ==================================================
// DOCUMENT UPLOAD
// ==================================================

async function initializeDocumentUploads() {

    const documentTypes = [

        {
            type: "passportPhoto",
            inputId: "passportPhoto",
            statusId: "passportPhotoStatus",
            label: "Passport Size Photo"
        },

        {
            type: "aadhaarDocument",
            inputId: "aadhaarDocument",
            statusId: "aadhaarDocumentStatus",
            label: "Aadhaar Card"
        },

        {
            type: "panDocument",
            inputId: "panDocument",
            statusId: "panDocumentStatus",
            label: "PAN Card"
        }

    ];


    documentTypes.forEach(documentInfo => {

        const fileInput =
            document.getElementById(
                documentInfo.inputId
            );


        fileInput.addEventListener(
            "change",
            async function () {

                const file =
                    this.files[0];


                if (!file) {

                    return;

                }


                const statusElement =
                    document.getElementById(
                        documentInfo.statusId
                    );


                // Validate file type

                const allowedTypes = [

                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                    "image/jpg"

                ];


                if (!allowedTypes.includes(file.type)) {

                    alert(
                        "Please upload a PDF, JPG or PNG file."
                    );

                    this.value = "";

                    return;

                }


                // Validate file size (5 MB)

                const maxSize =
                    5 * 1024 * 1024;


                if (file.size > maxSize) {

                    alert(
                        "File size should not exceed 5 MB."
                    );

                    this.value = "";

                    return;

                }


                try {

                    statusElement.textContent =
                        "Uploading...";


                    await window.saveEmployeeDocumentToDB(
                        currentEmployeeId,
                        documentInfo.type,
                        file
                    );


                    statusElement.textContent =
                        "Document uploaded successfully.";


                    // Refresh uploaded document information

                    await displayEmployeeDocuments();


                    alert(
                        documentInfo.label +
                        " uploaded successfully!"
                    );


                } catch (error) {

                    console.error(
                        "Document upload error:",
                        error
                    );


                    statusElement.textContent =
                        "Upload failed.";


                    alert(
                        "Unable to upload document. Please try again."
                    );

                }

            }

        );

    });

}


// ==================================================
// SAVE PROFILE
// ==================================================

profileForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Browser validation

        if (!profileForm.checkValidity()) {

            profileForm.reportValidity();

            return;

        }


        // Date of birth validation

        const dateOfBirth =
            document.getElementById("dateOfBirth").value;


        if (dateOfBirth > today) {

            alert(
                "Date of birth cannot be in the future."
            );

            dateOfBirthInput.focus();

            return;

        }


        // Mobile number validation

        const phone =
            document.getElementById("phone").value.trim();


        if (!/^[0-9]{10}$/.test(phone)) {

            alert(
                "Mobile number must contain exactly 10 digits."
            );

            document.getElementById("phone").focus();

            return;

        }


        // Emergency contact validation

        const emergencyContactNumber =
            document.getElementById(
                "emergencyContactNumber"
            ).value.trim();


        if (!/^[0-9]{10}$/.test(emergencyContactNumber)) {

            alert(
                "Emergency contact number must contain exactly 10 digits."
            );

            document.getElementById(
                "emergencyContactNumber"
            ).focus();

            return;

        }


        // Postal code validation

        const postalCode =
            document.getElementById("postalCode").value.trim();


        if (!/^[0-9]{6}$/.test(postalCode)) {

            alert(
                "Postal code must contain exactly 6 digits."
            );

            document.getElementById("postalCode").focus();

            return;

        }


        // Load current employee

        const employee =
            await loadEmployee();


        if (!employee) {

            return;

        }


        // Update personal information

        employee.firstName =
            document.getElementById("firstName").value.trim();


        employee.lastName =
            document.getElementById("lastName").value.trim();


        employee.dateOfBirth =
            dateOfBirth;


        employee.phone =
            phone;


        employee.mobileNumber =
            phone;


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
            document.getElementById(
                "emergencyContactName"
            ).value.trim();


        employee.emergencyContactNumber =
            emergencyContactNumber;


        employee.emergencyContactRelationship =
            document.getElementById(
                "emergencyContactRelationship"
            ).value.trim();


        // Get saved employees

        const savedEmployees =
            JSON.parse(
                localStorage.getItem("employees")
            ) || [];


        // Find current employee

        const employeeIndex =
            savedEmployees.findIndex(savedEmployee =>

                String(savedEmployee.employeeId).toLowerCase() ===
                currentEmployeeId.toLowerCase()

            );


        if (employeeIndex !== -1) {

            savedEmployees[employeeIndex] = {

                ...savedEmployees[employeeIndex],

                ...employee

            };

        } else {

            savedEmployees.push(employee);

        }


        // Save employee

        localStorage.setItem(
            "employees",
            JSON.stringify(savedEmployees)
        );


        // Success

        alert(
            "Profile updated successfully!"
        );


        window.location.href =
            "employee-dashboard.html";

    }

);


// ==================================================
// CANCEL BUTTON
// ==================================================

const cancelButton =
    document.getElementById("cancelButton");


if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "employee-dashboard.html";

        }
    );

}


// ==================================================
// LOGOUT
// ==================================================

const logoutButton =
    document.getElementById("employeeLogout");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                localStorage.removeItem(
                    "currentEmployeeId"
                );

                localStorage.removeItem(
                    "loggedInRole"
                );


                window.location.href =
                    "index.html";

            }

        }
    );

}


// ==================================================
// INITIALIZE PROFILE
// ==================================================

async function initializeProfile() {

    await displayEmployeeProfile();

    await initializeDocumentUploads();

}


initializeProfile();