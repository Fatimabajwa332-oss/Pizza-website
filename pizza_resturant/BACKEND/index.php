<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

echo json_encode([
    'status' => 'API is running',
    'endpoints' => [
        'GET /api/pizzas.php' => 'Get all pizzas',
        'GET /api/pizzas.php?category=veg' => 'Get vegetarian pizzas',
        'GET /api/pizzas.php?category=non-veg' => 'Get non-vegetarian pizzas',
        'POST /api/pizzas.php' => 'Add new pizza',
        'GET /api/drinks.php' => 'Get all drinks',
        'POST /api/orders.php' => 'Place new order'
    ],
    'timestamp' => date('Y-m-d H:i:s')
]);
?>