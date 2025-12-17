# 🛒 Minago - Multi-Vendor E-Commerce Platform

Minago is a full-stack **Multi-Vendor E-Commerce Application** built using the **MERN Stack** (MongoDB, Express, React, Node.js). It features a robust Role-Based Access Control (RBAC) system that distinguishes between Customers, Sellers, and Administrators, providing unique dashboards and functionalities for each.

## 🚀 Key Features

### 👤 Customer (User)
* **Authentication:** Secure Login/Register with JWT.
* **Browsing:** View all products with search and filtering.
* **Shopping Cart:** Add/Remove items, adjust quantities, real-time subtotal calculation.
* **Checkout:** Secure checkout flow with address validation.
* **Order History:** View past orders and status updates.
* **Profile:** Manage address and profile picture (generated via UI Avatars).

### 🏪 Seller
* **Seller Registration:** Apply to become a seller (requires Admin approval).
* **Seller Dashboard:** Real-time analytics showing *only* their revenue and order counts.
* **Product Management:** Upload, Edit, and Delete products.
* **Isolation Logic:** Sellers can only modify products they own.
* **Order Tracking:** View orders containing their specific products.

### 🛡️ Admin
* **Master Dashboard:** Overview of total revenue, total users, global sales trends, and recent orders.
* **User Management:** View all users and sellers.
* **Seller Verification:** Approve or Reject new seller applications (KYC flow).
* **Global Control:** Ability to delete any product or user if necessary.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, React Router DOM, Axios, Recharts (for analytics), React Icons.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas (Cloud).
* **Authentication:** JSON Web Tokens (JWT), Bcrypt.js.
* **Image Handling:** Multer (Local storage for product/profile images).

---

## 📂 Project Structure

```bash
minago/
├── minago-backend/     # Node.js & Express Server
│   ├── controllers/    # Logic for Auth, Products, Orders
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Endpoints
│   ├── uploads/        # Image storage folder
│   └── server.js       # Entry point
│
└── minago-frontend/    # React Client
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Main views (Home, Cart, Dashboards)
    │   └── App.jsx     # Routing Logic







    ⚙️ Workflow
Registration: Users sign up. To become a seller, they fill out a "Become a Seller" form with business details.

Verification: Admin approves the Seller request via the Admin Dashboard.

Inventory: Sellers upload products.

Purchase: Customers buy products.

Fulfillment: Sellers see the order in their dashboard and fulfill it.

Analytics: Admin tracks global platform performance; Sellers track individual performance.

🔧 Installation & Setup Guide
Follow these steps to run the project locally.

1. Prerequisites

Node.js installed.

MongoDB Atlas Account (or local MongoDB installed).

2. Clone the Repository

Bash
git clone <your-repository-url>
cd minago
3. Backend Setup

Navigate to the backend folder and install dependencies:

Bash
cd minago-backend
npm install
Create a .env file in the minago-backend folder with the following contents:

Code snippet
PORT=3000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
Note: Create an uploads folder inside minago-backend if it doesn't exist.

4. Frontend Setup

Navigate to the frontend folder and install dependencies:

Bash
cd ../minago-frontend
npm install
🚀 How to Run
You need to run the Backend and Frontend in two separate terminals.

Terminal 1 (Backend):

Bash
cd minago-backend
node server.js
# Output should say: "MongoDB Connected" and "Server running on port 3000"
Terminal 2 (Frontend):

Bash
cd minago-frontend
npm run dev
# Open the localhost link provided (usually http://localhost:5173)
⚠️ Important Post-Clone Instructions
Since this project uses a real database and local file storage, you need to configure a few things after cloning:

Database Connection:

The project expects a MongoDB connection string.

You must replace your_mongodb_connection_string_here in the .env file with your actual MongoDB Atlas URI.

Creating the First Admin:

There is no "Sign up as Admin" button for security reasons.

Step 1: Register a normal user via the website (e.g., username: admin).

Step 2: Go to your MongoDB Atlas Database -> Collections -> users.

Step 3: Find the user you just created and manually edit the field "role": "user" to "role": "admin".

Step 4: Log out and Log back in to access the Admin Dashboard.

Images:

Since images are stored locally in the uploads/ folder, images uploaded by previous users will not appear if you are on a different computer (unless you copied the folder).

You may need to manually create a folder named uploads inside minago-backend to ensure image uploading works without errors.

🤝 Contributing
Fork the repository.

Create a new branch (git checkout -b feature-branch).

Commit your changes.

Push to the branch.

Open a Pull Request.