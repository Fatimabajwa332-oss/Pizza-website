<?php
require_once '../config.php';

$conn = getConnection();

$sql = "SELECT * FROM drinks ORDER BY created_at DESC";
$result = $conn->query($sql);

$drinks = [];
while ($row = $result->fetch_assoc()) {
    $drinks[] = [
        'id' => $row['id'],
        'name' => $row['name'],
        'description' => $row['description'],
        'image_url' => $row['image_url'],
        'price' => (float)$row['price'],
        'category' => $row['category']
    ];
}

echo json_encode($drinks);

$conn->close();
?>