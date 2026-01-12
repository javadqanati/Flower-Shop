<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

if (!isset($_SESSION['user'])) {
    echo json_encode([
        "success" => false,
        "message" => "Login required"
    ]);
    exit;
}

$userId = $_SESSION['user']['id'];

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['product_id'], $data['quantity'])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid data"
    ]);
    exit;
}

$database = new Database();
$pdo = $database->getConnection();

$stmt = $pdo->prepare("
    UPDATE cart
    SET quantity = :quantity
    WHERE user_id = :user_id AND product_id = :product_id
");

$stmt->execute([
    ":quantity" => (int)$data['quantity'],
    ":user_id" => $userId,
    ":product_id" => (int)$data['product_id']
]);

echo json_encode(["success" => true]);
