<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

$categoryId = $_GET["id"] ?? null;

if (!$categoryId) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Category ID required"
    ]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("
        SELECT
            p.id,
            p.name,
            p.price,
            p.is_featured,
            pi.image_url
        FROM products p
        INNER JOIN product_categories pc
            ON pc.product_id = p.id
        LEFT JOIN product_images pi
            ON pi.product_id = p.id AND pi.is_primary = 1
        WHERE pc.category_id = :category_id
          AND p.is_active = 1
        ORDER BY p.name ASC
    ");

    $stmt->execute([
        ":category_id" => $categoryId
    ]);

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "products" => $products
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load category products"
    ]);
}
    