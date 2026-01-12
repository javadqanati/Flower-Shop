<?php
header("Content-Type: application/json");
session_start();

require_once "../../config/db.php";

// SECURITY: admin only
if (
    !isset($_SESSION['user']) ||
    !isset($_SESSION['user']['role']) ||
    $_SESSION['user']['role'] !== 'ADMIN'
) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

/* ======================
   KPI QUERIES
====================== */

// Total orders
$totalOrders = $conn->query("SELECT COUNT(*) FROM orders")->fetchColumn();

// Total revenue (exclude cancelled)
$totalRevenue = $conn->query("
    SELECT COALESCE(SUM(total_price),0)
    FROM orders
    WHERE status != 'cancelled'
")->fetchColumn();

// Total users
$totalUsers = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();

// Active products
$activeProducts = $conn->query("
    SELECT COUNT(*) FROM products WHERE is_active = 1
")->fetchColumn();

// Pending orders
$pendingOrders = $conn->query("
    SELECT COUNT(*) FROM orders WHERE status = 'pending'
")->fetchColumn();

/* ======================
   CHART DATA
====================== */

// Orders per day (last 7 days)
$ordersPerDayStmt = $conn->prepare("
    SELECT DATE(created_at) as day, COUNT(*) as total
    FROM orders
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY day
    ORDER BY day
");
$ordersPerDayStmt->execute();
$ordersPerDay = $ordersPerDayStmt->fetchAll(PDO::FETCH_ASSOC);

// Revenue per day (last 7 days)
$revenuePerDayStmt = $conn->prepare("
    SELECT DATE(created_at) as day, SUM(total_price) as total
    FROM orders
    WHERE status != 'cancelled'
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY day
    ORDER BY day
");
$revenuePerDayStmt->execute();
$revenuePerDay = $revenuePerDayStmt->fetchAll(PDO::FETCH_ASSOC);

// Order status distribution
$statusStmt = $conn->query("
    SELECT status, COUNT(*) as total
    FROM orders
    GROUP BY status
");
$orderStatus = $statusStmt->fetchAll(PDO::FETCH_ASSOC);

/* ======================
   RESPONSE
====================== */

echo json_encode([
    "kpis" => [
        "totalOrders" => (int)$totalOrders,
        "totalRevenue" => (float)$totalRevenue,
        "totalUsers" => (int)$totalUsers,
        "activeProducts" => (int)$activeProducts,
        "pendingOrders" => (int)$pendingOrders
    ],
    "charts" => [
        "ordersPerDay" => $ordersPerDay,
        "revenuePerDay" => $revenuePerDay,
        "orderStatus" => $orderStatus
    ]
]);
exit;

