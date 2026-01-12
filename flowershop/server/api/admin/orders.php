<?php
header("Content-Type: application/json");
session_start();

require_once "../../config/db.php";

/* SECURITY CHECK */
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

$stmt = $conn->prepare("
    SELECT o.id,
           o.total_price,
           o.status,
           o.created_at,
           u.username AS customer
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
");
$stmt->execute();

$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($orders);
