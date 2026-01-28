<?php
require_once '../config.php';

$conn = getConnection();

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $category = isset($_GET['category']) ? $_GET['category'] : 'all';
    
    if ($category === 'all') {
        $sql = "SELECT * FROM pizzas ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
    } else {
        $sql = "SELECT * FROM pizzas WHERE category = ? ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $category);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $pizzas = [];
    while ($row = $result->fetch_assoc()) {
        $pizzas[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'image_url' => $row['image_url'],
            'price_small' => (float)$row['price_small'],
            'price_medium' => (float)$row['price_medium'],
            'price_large' => (float)$row['price_large'],
            'category' => $row['category'],
            'ingredients' => $row['ingredients']
        ];
    }
    
    echo json_encode($pizzas);
    $stmt->close();
    $conn->close();
    exit();
}

// Handle POST requests (Add new pizza)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name'], $data['description'], $data['image_url'], $data['price_small'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }
    
    $name = $data['name'];
    $description = $data['description'];
    $image_url = $data['image_url'];
    $price_small = (float)$data['price_small'];
    $price_medium = isset($data['price_medium']) ? (float)$data['price_medium'] : $price_small + 3;
    $price_large = isset($data['price_large']) ? (float)$data['price_large'] : $price_small + 6;
    $category = $data['category'] ?? 'veg';
    $ingredients = $data['ingredients'] ?? '';
    
    $sql = "INSERT INTO pizzas (name, description, image_url, price_small, price_medium, price_large, category, ingredients) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssdddss", $name, $description, $image_url, $price_small, $price_medium, $price_large, $category, $ingredients);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Pizza added successfully',
            'id' => $stmt->insert_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add pizza: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    exit();
}
?>