fetch("http://localhost/flowershop/server/api/admin/auth_check.php", {
    credentials: "include"
})
    .then(async res => {
        if (!res.ok) {
            let data;
            try {
                data = await res.json();
            } catch {
                data = { error: "Session invalid" };
            }

            alert(data.error || "Unauthorized");
            window.location.href = "login.html";
        }
    })
    .catch(err => {
        console.error(err);
        alert("Network or server error");
        window.location.href = "login.html";
    });
