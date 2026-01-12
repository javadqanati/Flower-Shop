<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db.php";

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Login required"
    ]);
    exit;
}

$userId = $_SESSION['user']['id'];

$address = $_POST['address'] ?? null;
$phone   = $_POST['phone'] ?? null;

if (!$address || !$phone) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing address or phone"
    ]);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

/* 1️⃣ Load cart from DB */
$stmt = $pdo->prepare("
    SELECT c.product_id, c.quantity, p.price
    FROM cart c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = :user_id
");
$stmt->execute([":user_id" => $userId]);
$cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($cartItems)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Cart is empty"
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    /* 2️⃣ Create order */
    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, shipping_address, contact_phone)
        VALUES (:user_id, :address, :phone)
    ");
    $stmt->execute([
        ":user_id" => $userId,
        ":address" => $address,
        ":phone"   => $phone
    ]);

    $orderId = $pdo->lastInsertId();
    $totalPrice = 0;

    /* 3️⃣ Insert order items */
    $stmtItem = $pdo->prepare("
        INSERT INTO order_items
            (order_id, product_id, quantity, price_at_time)
        VALUES
            (:order_id, :product_id, :quantity, :price)
    ");

    foreach ($cartItems as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $totalPrice += $subtotal;

        $stmtItem->execute([
            ":order_id"  => $orderId,
            ":product_id"=> $item['product_id'],
            ":quantity"  => $item['quantity'],
            ":price"     => $item['price']
        ]);
    }

    /* 4️⃣ Update order total */
    $pdo->prepare("
        UPDATE orders
        SET total_price = :total
        WHERE id = :order_id
    ")->execute([
        ":total" => $totalPrice,
        ":order_id" => $orderId
    ]);

    /* 5️⃣ Clear cart */
    $pdo->prepare("
        DELETE FROM cart WHERE user_id = :user_id
    ")->execute([":user_id" => $userId]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "redirect" => "/flowershop/public/fakepay.html?order=$orderId"
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Order creation failed"
    ]);
}
