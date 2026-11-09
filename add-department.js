// Department status color

const departmentStatusSelect = document.getElementById("status");

function updateDepartmentStatusColor() {
    departmentStatusSelect.classList.remove(
        "status-active",
        "status-inactive"
    );

    if (departmentStatusSelect.value === "Active") {
        departmentStatusSelect.classList.add("status-active");
    } else {
        departmentStatusSelect.classList.add("status-inactive");
    }
}

departmentStatusSelect.addEventListener(
    "change",
    updateDepartmentStatusColor
);

updateDepartmentStatusColor();

const departmentForm =
    document.getElementById("departmentForm");


departmentForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const departmentId =
        document.getElementById("departmentId").value.trim();

    const departmentName =
        document.getElementById("departmentName").value.trim();

    const manager =
        document.getElementById("manager").value.trim();

    const status =
        document.getElementById("status").value;


    if (
        departmentId === "" ||
        departmentName === "" ||
        manager === ""
    ) {

        alert("Please fill in all the required fields.");

        return;
    }


    const newDepartment = {

        departmentId: departmentId,

        departmentName: departmentName,

        manager: manager,

        status: status

    };


    // Get existing departments from localStorage
    const existingDepartments =
        JSON.parse(localStorage.getItem("departments")) || [];


    // Add the new department
    existingDepartments.push(newDepartment);


    // Save the updated list
    localStorage.setItem(
        "departments",
        JSON.stringify(existingDepartments)
    );


    alert("Department added successfully!");


    window.location.href = "departments.html";

});