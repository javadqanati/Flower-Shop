<?php
require_once __DIR__ . "/../../config/db.php";
header("Content-Type: application/json");

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing product id"]);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare("
    SELECT p.*,
           pi.image_url
    FROM products p
    LEFT JOIN product_images pi
        ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE p.id = ? AND p.is_active = 1
");
$stmt->execute([$id]);

$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Product not found"]);
    exit;
}

echo json_encode(["success" => true, "product" => $product]);
