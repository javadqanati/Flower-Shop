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

if (!isset($data['product_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid data"
    ]);
    exit;
}

$productId = (int)$data['product_id'];
$quantity = 1; // ✅ DEFAULT

$database = new Database();
$pdo = $database->getConnection();

$stmt = $pdo->prepare("
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (:user_id, :product_id, :quantity)
    ON DUPLICATE KEY UPDATE quantity = quantity + :quantity
");

$stmt->execute([
    ":user_id"     => $userId,
    ":product_id" => $productId,
    ":quantity"   => $quantity
]);

echo json_encode(["success" => true]);
