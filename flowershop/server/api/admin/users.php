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
    SELECT id, username, email, role, is_active, created_at
    FROM users
    ORDER BY created_at DESC
");
$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
