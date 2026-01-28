<?php
require_once '../config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = getConnection();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetRequest($conn);
        break;
    case 'POST':
        handlePostRequest($conn);
        break;
    case 'PUT':
        handlePutRequest($conn);
        break;
    case 'DELETE':
        handleDeleteRequest($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

$conn->close();

// GET: Fetch all reservations or by ID
function handleGetRequest($conn) {
    // Check if requesting single reservation by ID
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM reservations WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $reservation = $result->fetch_assoc();
            echo json_encode([
                'success' => true,
                'data' => formatReservationData($reservation)
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Reservation not found'
            ]);
        }
        
        $stmt->close();
        return;
    }
    
    // Check if requesting reservations by date
    if (isset($_GET['date'])) {
        $date = $conn->real_escape_string($_GET['date']);
        $sql = "SELECT * FROM reservations WHERE reservation_date = ? ORDER BY reservation_time ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $date);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reservations = [];
        while ($row = $result->fetch_assoc()) {
            $reservations[] = formatReservationData($row);
        }
        
        echo json_encode([
            'success' => true,
            'data' => $reservations,
            'count' => count($reservations)
        ]);
        
        $stmt->close();
        return;
    }
    
    // Get all reservations
    $sql = "SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time DESC";
    $result = $conn->query($sql);
    
    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        $reservations[] = formatReservationData($row);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $reservations,
        'count' => count($reservations)
    ]);
}

// POST: Create new reservation
function handlePostRequest($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['customer_name', 'email', 'phone', 'reservation_date', 'reservation_time', 'number_of_guests'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode([
                'success' => false,
                'message' => "Missing required field: $field"
            ]);
            return;
        }
    }
    
    // Prepare data
    $customer_name = $conn->real_escape_string($data['customer_name']);
    $email = $conn->real_escape_string($data['email']);
    $phone = $conn->real_escape_string($data['phone']);
    $reservation_date = $conn->real_escape_string($data['reservation_date']);
    $reservation_time = $conn->real_escape_string($data['reservation_time']);
    $number_of_guests = intval($data['number_of_guests']);
    $special_requests = isset($data['special_requests']) ? $conn->real_escape_string($data['special_requests']) : '';
    
    // Validate date is not in the past
    $today = date('Y-m-d');
    if ($reservation_date < $today) {
        echo json_encode([
            'success' => false,
            'message' => 'Reservation date cannot be in the past'
        ]);
        return;
    }
    
    // Check capacity for the time slot (max 4 reservations per time slot for demo)
    $capacityCheck = "SELECT COUNT(*) as count FROM reservations 
                      WHERE reservation_date = ? AND reservation_time = ?";
    $stmt = $conn->prepare($capacityCheck);
    $stmt->bind_param("ss", $reservation_date, $reservation_time);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    if ($row['count'] >= 4) {
        echo json_encode([
            'success' => false,
            'message' => 'This time slot is fully booked. Please choose another time.'
        ]);
        $stmt->close();
        return;
    }
    $stmt->close();
    
    // Insert reservation
    $sql = "INSERT INTO reservations (customer_name, email, phone, reservation_date, reservation_time, number_of_guests, special_requests) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssis", $customer_name, $email, $phone, $reservation_date, $reservation_time, $number_of_guests, $special_requests);
    
    if ($stmt->execute()) {
        $reservation_id = $stmt->insert_id;
        
        // Fetch the created reservation
        $selectSql = "SELECT * FROM reservations WHERE id = ?";
        $selectStmt = $conn->prepare($selectSql);
        $selectStmt->bind_param("i", $reservation_id);
        $selectStmt->execute();
        $result = $selectStmt->get_result();
        $reservation = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Reservation created successfully',
            'data' => formatReservationData($reservation),
            'reservation_id' => $reservation_id
        ]);
        
        $selectStmt->close();
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create reservation: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
}

// PUT: Update reservation
function handlePutRequest($conn) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'Reservation ID is required'
        ]);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Build update query dynamically based on provided fields
    $updates = [];
    $params = [];
    $types = '';
    
    if (isset($data['customer_name'])) {
        $updates[] = "customer_name = ?";
        $params[] = $conn->real_escape_string($data['customer_name']);
        $types .= 's';
    }
    
    if (isset($data['email'])) {
        $updates[] = "email = ?";
        $params[] = $conn->real_escape_string($data['email']);
        $types .= 's';
    }
    
    if (isset($data['phone'])) {
        $updates[] = "phone = ?";
        $params[] = $conn->real_escape_string($data['phone']);
        $types .= 's';
    }
    
    if (isset($data['reservation_date'])) {
        $updates[] = "reservation_date = ?";
        $params[] = $conn->real_escape_string($data['reservation_date']);
        $types .= 's';
    }
    
    if (isset($data['reservation_time'])) {
        $updates[] = "reservation_time = ?";
        $params[] = $conn->real_escape_string($data['reservation_time']);
        $types .= 's';
    }
    
    if (isset($data['number_of_guests'])) {
        $updates[] = "number_of_guests = ?";
        $params[] = intval($data['number_of_guests']);
        $types .= 'i';
    }
    
    if (isset($data['special_requests'])) {
        $updates[] = "special_requests = ?";
        $params[] = $conn->real_escape_string($data['special_requests']);
        $types .= 's';
    }
    
    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $params[] = $conn->real_escape_string($data['status']);
        $types .= 's';
    }
    
    if (empty($updates)) {
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        return;
    }
    
    $sql = "UPDATE reservations SET " . implode(', ', $updates) . " WHERE id = ?";
    $params[] = $id;
    $types .= 'i';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Reservation updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update reservation: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
}

// DELETE: Cancel reservation
function handleDeleteRequest($conn) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'Reservation ID is required'
        ]);
        return;
    }
    
    // Instead of deleting, mark as cancelled
    $sql = "UPDATE reservations SET status = 'cancelled' WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Reservation cancelled successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to cancel reservation: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
}

// Helper function to format reservation data
function formatReservationData($row) {
    return [
        'id' => $row['id'],
        'customer_name' => $row['customer_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'reservation_date' => $row['reservation_date'],
        'reservation_time' => $row['reservation_time'],
        'number_of_guests' => $row['number_of_guests'],
        'special_requests' => $row['special_requests'],
        'status' => $row['status'],
        'created_at' => $row['created_at'],
        'formatted_date' => date('F j, Y', strtotime($row['reservation_date'])),
        'formatted_time' => date('h:i A', strtotime($row['reservation_time']))
    ];
}
?>