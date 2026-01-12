<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
include_once "../../config/db.php";

$db = new Database();
$conn = $db->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->email) && !empty($data->password)) {

    $check = $conn->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $check->bindParam(":email", $data->email);
    $check->execute();

    if ($check->rowCount() > 0) {
        echo json_encode(["message" => "Email already registered."]);
        exit;
    }

    $query = "INSERT INTO users (username, email, password_hash) 
              VALUES (:username, :email, :password_hash)";

    $stmt = $conn->prepare($query);

    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    $stmt->bindParam(":username", $data->username);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password_hash", $password_hash);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "User registered successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Registration failed."
            ]);
    }

} else {
    echo json_encode([
        "success" => false,
        "message" => "Incomplete data."
        ]);
}
