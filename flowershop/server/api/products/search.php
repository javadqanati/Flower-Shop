<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

$query = $_GET["q"] ?? "";

if (trim($query) === "") {
    echo json_encode([
        "success" => true,
        "products" => []
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
        LEFT JOIN product_images pi
            ON pi.product_id = p.id AND pi.is_primary = 1
        WHERE p.is_active = 1
          AND p.name LIKE :query
        ORDER BY p.name ASC
    ");

    $stmt->execute([
        ":query" => "%" . $query . "%"
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
        "message" => "Search failed"
    ]);
}
