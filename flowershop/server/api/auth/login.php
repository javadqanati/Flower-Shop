<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

// ✅ Create DB connection correctly
$database = new Database();
$pdo = $database->getConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (
    !isset($data['username']) ||
    !isset($data['password']) ||
    trim($data['username']) === '' ||
    trim($data['password']) === ''
) {
    echo json_encode([
        "success" => false,
        "message" => "Incomplete data"
    ]);
    exit;
}

$username = trim($data['username']);
$password = $data['password'];

try {
    $stmt = $pdo->prepare("
        SELECT id, username, email, password_hash, role
        FROM users
        WHERE username = :username AND is_active = 1
        LIMIT 1
    ");

    $stmt->execute([
        ":username" => $username
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password"
        ]);
        exit;
    }

    // ✅ THIS IS THE SESSION (LOGIN STATE)
    $_SESSION['user'] = [
        "id" => $user['id'],
        "username" => $user['username'],
        "email" => $user['email'],
        "role" => $user['role']
    ];

    echo json_encode([
        "success" => true,
        "role" => $user['role']
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Query failed"
    ]);
    exit;
}
