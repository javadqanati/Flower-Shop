console.log("AUTH JS LOADED");

const API_URL = "http://localhost/flowershop/server/api/auth/";


async function registerUser() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    try {
        const response = await fetch(API_URL + "register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        console.log("register response:", response.status, result);

        if (result.success) {
            alert(result.message || "Registered");
            window.location.href = "http://localhost/flowershop/public/login.html";
        } else {
            alert("Registration failed: " + (result.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Fetch/register error:", err);
        alert("Network or server error. Check console and network tab.");
    }
}

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    try {
        const response = await fetch(API_URL + "login.php", {
            method: "POST",
            credentials: "include", // 🔥 REQUIRED
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        console.log("login response:", response.status, result);

        if (!result.success) {
            alert(result.message || "Login failed");
            return;
        }

        alert("Login successful");

        if (result.role === "ADMIN") {
            window.location.href = "/flowershop/public/admin.html";
        } else {
            window.location.href = "/flowershop/public/index.html";
        }

    } catch (err) {
        console.error("Fetch/login error:", err);
        alert("Login fetch error (check console)");
    }
}




async function logout() {
    try {
        const res = await fetch("/flowershop/server/api/auth/logout.php", {
            method: "POST",
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
            alert("Logout successful");
        } else {
            alert("Logout failed");
        }
    } catch (e) {
        alert("Logout failed (network error)");
    } finally {
        window.location.href = "/flowershop/public/login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", logout);
});



function getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}





