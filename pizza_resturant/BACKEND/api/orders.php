<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$conn = getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['customer_name'], $data['email'], $data['phone'], $data['address'], $data['city'], $data['postal_code'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$customer_name = $data['customer_name'];
$email = $data['email'];
$phone = $data['phone'];
$address = $data['address'];
$city = $data['city'];
$postal_code = $data['postal_code'];
$order_notes = $data['order_notes'] ?? '';
$total_amount = $data['total_amount'] ?? 0;

$sql = "INSERT INTO orders (customer_name, email, phone, address, city, postal_code, order_notes, total_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssssd", $customer_name, $email, $phone, $address, $city, $postal_code, $order_notes, $total_amount);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully',
        'order_id' => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to place order: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>