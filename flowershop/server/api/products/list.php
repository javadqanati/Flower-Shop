<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

try {
    // 1. Create DB instance
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // 2. Query
    $sql = "
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock_quantity,
            p.is_featured,
            c.name AS category,
            img.image_url
        FROM products p
        LEFT JOIN product_categories pc ON pc.product_id = p.id
        LEFT JOIN categories c ON c.id = pc.category_id
        LEFT JOIN product_images img
            ON img.product_id = p.id AND img.is_primary = 1
        WHERE p.is_active = 1 AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "products" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
