<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

// admin check (reuse your existing logic)
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$orderId = $_POST['order_id'] ?? null;
$status  = $_POST['status'] ?? null;

$allowed = ['pending','processing','shipped','delivered','cancelled'];

if (!$orderId || !in_array($status, $allowed)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid data"]);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare(
    "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?"
);
$stmt->execute([$status, $orderId]);

echo json_encode(["success" => true]);
