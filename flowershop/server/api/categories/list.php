<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

try {
    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("
        SELECT id, name, description
        FROM categories
        ORDER BY name ASC
    ");
    $stmt->execute();

    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "categories" => $categories
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load categories"
    ]);
}
