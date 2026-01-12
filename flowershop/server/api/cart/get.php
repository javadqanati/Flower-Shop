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

$database = new Database();
$pdo = $database->getConnection();

$stmt = $pdo->prepare("
    SELECT
        c.product_id,
        c.quantity,
        p.name,
        CAST(p.price AS DECIMAL(10,2)) AS price,
        pi.image_url
    FROM cart c
    JOIN products p ON p.id = c.product_id
    LEFT JOIN product_images pi
        ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE c.user_id = :user_id
");

$stmt->execute([":user_id" => $userId]);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "items" => $items
]);
