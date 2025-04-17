document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const themeButton = document.getElementById("theme-button");
    const roleSelection = document.querySelector(".role-selection");
    const loginContainer = document.querySelector(".login-container");
    const adminLoginButton = document.getElementById("admin-login");
    const userLoginButton = document.getElementById("user-login");
    const userTypeInput = document.getElementById("user-type");

    // Show Login Form Based on Role Selection
    adminLoginButton.addEventListener("click", () => {
        userTypeInput.value = "admin";
        console.log("Selected Role: Admin");  
        roleSelection.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    });

    userLoginButton.addEventListener("click", () => {
        userTypeInput.value = "user";
        console.log("Selected Role: User");  
        roleSelection.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    });

    // Handle Login
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const loginId = document.getElementById("login-id").value.trim();
        const password = document.getElementById("password").value.trim();
        const roomCode = document.getElementById("room-code").value.trim().toUpperCase();
        const userType = document.getElementById("user-type").value;

        console.log("User Type Before API Call:", userType); 

        if (!loginId || !password || !roomCode || !userType) {
            Swal.fire("Oops...", "All fields are required!", "error");
            return;
        }

        let endpoint = userType === "admin" ? "admin/login" : "user/login"; 

        try {
            const response = await fetch(`http://localhost:5000/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loginId, password, roomCode })
            });

            const data = await response.json();
            console.log("API Response:", data); 

            if (response.ok) {
                Swal.fire("Login Successful!", "Redirecting to dashboard...", "success");
                
                localStorage.setItem("loggedUser", loginId);
                localStorage.setItem("roomCode", roomCode);
                localStorage.setItem("userType", userType);

                console.log("Stored User Type:", localStorage.getItem("userType")); 

                setTimeout(() => {
                    if (userType === "admin") {
                        console.log("Redirecting to Admin Dashboard"); 
                        window.location.href = "dashboard.html"; 
                    } else {
                        console.log("Redirecting to User Dashboard"); 
                        window.location.href = "dashboard.html";
                    }
                }, 2000);
            } else {
                Swal.fire("Login Failed!", data.error || "Invalid credentials", "error");
            }
        } catch (error) {
            console.error("Login Error:", error);
            Swal.fire("Error", "Something went wrong!", "error");
        }
    });

    // Theme Toggle
    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
        themeButton.textContent = isDarkMode ? "☀" : "🌙";
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    });

    // Load Theme Preference
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeButton.textContent = "☀";
    }
});