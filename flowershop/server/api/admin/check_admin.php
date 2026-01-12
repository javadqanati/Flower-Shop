<?php
    session_start();
    header("Content-Type: application/json");

    if (!isset($_SESSION["user"])) {
        http_response_code(401);
        echo json_encode(["authorized" => false]);
        exit;
    }

    if ($_SESSION["user"]["role"] !== "ADMIN") {
        http_response_code(403);
        echo json_encode(["authorized" => false]);
        exit;
    }

    echo json_encode(["authorized" => true]);
>