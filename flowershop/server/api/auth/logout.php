<?php
session_start();
header("Content-Type: application/json");

// Unset all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Delete session cookie (important)
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

echo json_encode(["success" => true]);
exit;
