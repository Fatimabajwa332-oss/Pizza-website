 🍕 Pizza Restaurant Website

A full-featured pizza restaurant website with online ordering and table reservations.

 🚀 Live Demo
Access via: `http://localhost/pizza_resturant/FRONTEND/`

 ✨ Features
- 🍕 Pizza Menu** - Browse pizzas with category filtering
- 📏 Size Selection** - Choose Small/Medium/Large sizes
- 🛒 Shopping Cart** - Add/remove items, update quantities
- 💳 Online Ordering** - Place delivery orders
- 📅 Table Reservations** - Book tables with date/time selection
- 🥤 Drink Menu** - Browse and order drinks
- 📱 Responsive Design** - Works on mobile & desktop

## 📁 Project Structure
pizza_resturant/
├── FRONTEND/
│ ├── index.html
│ ├── css/style.css
│ └── js/app.js
├── BACKEND/
│ ├── api/
│ │ ├── drinks.php
│ │ ├── orders.php
│ │ ├── pizzas.php
│ │ ├── reservations.php
│ │ ├── index.php
│ │ └── config.example.php
│ └── database.sql
├── .gitignore
└── README.md
## 🚀 Setup Instructions

### 1. Place in XAMPP
Put entire `pizza_resturant` folder in:
C:\xampp\htdocs\pizza_resturant\
### 2. Database Setup
1. Open phpMyAdmin (`http://localhost/phpmyadmin`)
2. Create database: `mammamia_pizzeria`
3. Import `BACKEND/database.sql`

### 3. Backend Setup
1. Copy `BACKEND/api/config.example.php` to `BACKEND/api/config.php`
2. Update database credentials in `BACKEND/api/config.php`

### 4. Run Application
1. Start Apache & MySQL in XAMPP
2. Open: `http://localhost/pizza_resturant/FRONTEND/`

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** PHP 8.2, MySQL
- **API:** RESTful endpoints
- **Storage:** LocalStorage for cart

## 📞 API Endpoints
- `GET /BACKEND/api/pizzas.php` - Get all pizzas
- `POST /BACKEND/api/orders.php` - Place order
- `POST /BACKEND/api/reservations.php` - Make reservation
- `GET /BACKEND/api/drinks.php` - Get all drinks

---
Made with ❤️ by [Fatima Arshad]
