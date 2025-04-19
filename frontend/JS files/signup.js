document.addEventListener("DOMContentLoaded", () => {
    const roleSelection = document.querySelector(".role-selection");
    const signupContainer = document.querySelector(".signup-container");
    const userTypeInput = document.getElementById("user-type");
    const adminSignupButton = document.getElementById("admin-signup");
    const userSignupButton = document.getElementById("user-signup");

    // Show Signup Form Based on Role Selection
    adminSignupButton.addEventListener("click", () => {
        userTypeInput.value = "admin";
        roleSelection.classList.add("hidden");
        signupContainer.classList.remove("hidden");
    });

    userSignupButton.addEventListener("click", () => {
        userTypeInput.value = "user";
        roleSelection.classList.add("hidden");
        signupContainer.classList.remove("hidden");
    });
});

async function signUp() {
    let username = document.getElementById("new-username").value.trim();
    let password = document.getElementById("new-password").value.trim();
    let roomCode = document.getElementById("new-room-code").value.trim();
    let userType = document.getElementById("user-type").value;

    if (!username || !password || !roomCode || !userType) {
        Swal.fire("Oops...", "All fields are required!", "error");
        return;
    }

    let endpoint = userType === "admin" ? "admin/signup" : "user/signup"; 

    try {
        const response = await fetch(`http://localhost:5000/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, room_code: roomCode })
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: "Success!",
                text: "Account created successfully!",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "homepage.html";
            });
        } else if (response.status === 409) {
            if (data.error === "username_exists") {
                Swal.fire("Username Exists", "The username is already taken. Try a different one.", "warning");
            } else if (data.error === "room_code_exists") {
                Swal.fire("Room Code Exists", "The room code is already taken. Try a different one.", "warning");
            }
        } else {
            Swal.fire("Signup Failed!", data.error || "Please try again", "error");
        }
    } catch (error) {
        console.error("Signup Error:", error);
        Swal.fire("Error", "Something went wrong!", "error");
    }
}
