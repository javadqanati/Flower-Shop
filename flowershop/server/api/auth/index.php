<?php
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");

    include_once "../../config/db.php";
    $db = new Database();
    $conn = $db->getConnection();
    session_start();

?>