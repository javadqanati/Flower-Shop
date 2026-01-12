<?php
header("Content-Type: application/json");

    include_once "http://localhost/flowershop/config/db.php";
    include_once "http://localhost/flowershop/server/api/admin/auth_check.php";

    $db = new Database();
    $conn = $db->getConnection();

    $data = [];

    $data['users'] = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $data['products'] = $conn->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $data['orders'] = $conn->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    $data['revenue'] = $conn->query("SELECT ISNULL(SUM(total_price),0) FROM orders")->fetchColumn();

    echo json_encode($data);
>