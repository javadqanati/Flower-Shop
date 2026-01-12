<?php
header("Content-Type: application/json");

    include_once "http://localhost/flowershop/config/db.php";


$stmt = $pdo->query("SELECT username, email FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
