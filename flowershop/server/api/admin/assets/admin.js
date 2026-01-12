let ordersChart, revenueChart, statusChart;


async function loadDashboard() {
    try {
        const res = await fetch("/flowershop/server/api/admin/dashboard_stats.php", {
            credentials: "include"
        });

        if (!res.ok) throw new Error("Failed to load dashboard");

        const data = await res.json();

        // KPIs
        document.getElementById("totalOrders").textContent = data.kpis.totalOrders;
        document.getElementById("totalRevenue").textContent = data.kpis.totalRevenue.toFixed(2);
        document.getElementById("totalUsers").textContent = data.kpis.totalUsers;
        document.getElementById("activeProducts").textContent = data.kpis.activeProducts;
        document.getElementById("pendingOrders").textContent = data.kpis.pendingOrders;

        renderOrdersChart(data.charts.ordersPerDay);
        renderRevenueChart(data.charts.revenuePerDay);
        renderStatusChart(data.charts.orderStatus);

    } catch (err) {
        console.error(err);
        alert("Dashboard load failed");
    }
}


document.addEventListener("DOMContentLoaded", () => {

    const sidebarLinks = document.querySelectorAll(".admin-sidebar a");
    const sections = document.querySelectorAll(".admin-section");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();

            const target = link.dataset.section;

            sections.forEach(sec => sec.classList.remove("active"));
            document.getElementById(target).classList.add("active");

            if (target === "dashboard") loadDashboard();
            if (target === "users") loadUsers();
            if (target === "products") loadProducts();
            if (target === "orders") loadOrders();
        });
    });

    const logoutBtn = document.getElementById("adminLogoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            await fetch("/flowershop/server/api/auth/logout.php", {
                method: "POST",
                credentials: "include"
            });

            window.location.href = "/flowershop/public/login.html?logout=success";
        });
    }

    loadDashboard();
});


function renderOrdersChart(data) {
    const ctx = document.getElementById("ordersChart");

    if (ordersChart) ordersChart.destroy();

    ordersChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => d.day),
            datasets: [{
                label: "Orders",
                data: data.map(d => d.total),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderRevenueChart(data) {
    const ctx = document.getElementById("revenueChart");

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map(d => d.day),
            datasets: [{
                label: "Revenue (€)",
                data: data.map(d => d.total)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderStatusChart(data) {
    const ctx = document.getElementById("statusChart");

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: data.map(d => d.status),
            datasets: [{
                data: data.map(d => d.total)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


async function loadUsers() {
    const res = await fetch("/flowershop/server/api/admin/users.php", {
        credentials: "include"
    });

    const users = await res.json();

    const tbody = document.getElementById("usersList");
    tbody.innerHTML = ""; // clear old rows

    users.forEach(user => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.is_active ? "Active" : "Disabled"}</td>
        `;

        tbody.appendChild(tr);
    });
}


async function loadProducts() {
    const res = await fetch("/flowershop/server/api/admin/products.php", {
        credentials: "include"
    });

    const products = await res.json();
    const tbody = document.getElementById("productsList");
    tbody.innerHTML = "";

    products.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.stock_quantity}</td>
            <td>${p.is_active ? "Active" : "Disabled"}</td>
        `;
        tbody.appendChild(tr);
    });
}


async function loadOrders() {
    const res = await fetch("/flowershop/server/api/admin/orders.php", {
        credentials: "include"
    });
    const orders = await res.json();

    const container = document.getElementById("orders");

    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total (€)</th>
                    <th>Status</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(o => {
        html += `
            <tr>
                <td>#${o.id}</td>
                <td>${o.customer ?? "-"}</td>
                <td>${Number(o.total_price).toFixed(2)}</td>
                <td>
                    <select onchange="updateOrderStatus(${o.id}, this.value)">
                        ${["pending","processing","shipped","delivered","cancelled"]
            .map(s => `
                                <option value="${s}" ${s === o.status ? "selected" : ""}>
                                    ${s}
                                </option>
                            `).join("")}
                    </select>
                </td>
                <td>${o.created_at}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

async function updateOrderStatus(orderId, status) {
    const res = await fetch(
        "/flowershop/server/api/admin/update_order_status.php",
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `order_id=${orderId}&status=${status}`
        }
    );

    const data = await res.json();
    if (!data.success) alert("Failed to update order");
}







