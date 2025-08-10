
# Overview
Campus Bites is a **full-stack web application** designed to modernize the college canteen experience. It provides students with a user-friendly platform to browse the menu, place orders, and track their status in real-time. For canteen staff, it offers a powerful admin dashboard to manage the menu, track live orders, and update order statuses efficiently.

***
https://campus-bites-tolb.onrender.com/

## Features

### For Students (Frontend)
* **Intuitive Menu:** Browse a complete menu with food images, prices, and categories (e.g., `Snacks`, `South Indian`, `Beverages`).
* **Today's Special:** A dynamic banner at the top of the page highlights the daily special, complete with a celebratory animation.
* **Real-time Stock Status:** Items marked as **"Sold Out"** by the admin are instantly reflected on the student-facing menu.
* **Shopping Cart:** A persistent cart allows students to add and remove items, adjust quantities, and view a subtotal.
* **Seamless Checkout:** A multi-step checkout process collects essential student details (name, roll number) and integrates with **Razorpay** for secure payments.
* **Live Order Tracking:** After placing an order, students can track its progress through a simple, three-step workflow: `Order Received` -> `Preparing` -> `Ready for Pickup`.

### For Canteen Staff (Admin Dashboard)
* **Secure Admin Login:** A dedicated login portal with separate credentials ensures only authorized personnel can access the dashboard.
* **Comprehensive Menu Management:**
    * Add, edit, or delete any menu item.
    * Instantly mark an item as "Sold Out" or "Available" with a single click.
    * Set a "Daily Special" to promote a specific dish, which automatically appears on the student page.
* **Live Order Management:** View all incoming orders in real-time.
* **Order Status Control:** Update the status of each order (`Preparing`, `Ready`, `Completed`) as it progresses.

***

## Technologies Used

### Frontend
* **HTML5, CSS3, JavaScript:** The core building blocks of the application.
* **Poppins Font:** A modern, clean font for a professional look.
* **Font Awesome:** Used for icons like the shopping cart.
* **Razorpay Checkout.js:** A robust and secure payment gateway for handling transactions.

### Backend
* **Node.js & Express.js:** A fast and minimalist backend framework for building REST APIs.
* **MongoDB Atlas:** A cloud-based NoSQL database for storing food items, user information, and orders.
* **Mongoose.js:** An elegant MongoDB object modeling tool for Node.js, making database interactions simpler.
* **Dotenv:** Manages environment variables to securely store credentials like API keys and database connection strings.
* **CORS:** A Node.js middleware for enabling Cross-Origin Resource Sharing.

### Deployment
* **Render:** A powerful cloud platform used to deploy both the frontend (as a Static Site) and the backend (as a Web Service).

***

## Installation and Setup

### Prerequisites
* **Node.js and npm:** Installed on your machine.
* **A MongoDB Atlas account** with a database.
* **A Razorpay account** with a Test Key ID and Key Secret.
