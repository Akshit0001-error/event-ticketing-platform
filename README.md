# 🎟️ Event Ticket Management Platform

A full-stack event management and ticketing platform built with **React, Spring Boot, PostgreSQL, JWT Authentication, Razorpay Payments, and QR Code Validation**.

The platform allows organizers to create and manage events, attendees to purchase tickets, and staff members to validate entries through QR code scanning.

---

## 🚀 Features

### 👤 Attendees

* Browse upcoming events
* View event details
* Purchase tickets online
* Access purchased tickets
* Download QR-based tickets

### 🎯 Organizers

* Create and manage events
* Configure ticket types
* Publish and update events
* Monitor ticket sales
* View analytics dashboard

### ✅ Staff

* Scan QR tickets
* Validate attendee entries
* Prevent duplicate check-ins

### 🔒 Security

* JWT Authentication
* Role-Based Access Control
* Protected APIs
* Secure payment verification

### 💳 Payments

* Razorpay integration
* Order creation
* Payment verification
* Transaction tracking

---

## 🏗️ Architecture

```text
Frontend (React + Vite)
        │
        ▼
REST APIs (Spring Boot)
        │
        ▼
 PostgreSQL Database
        │
        ▼
 Razorpay Payment Gateway
        │
        ▼
 QR Ticket Generation & Validation
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Recharts
* HTML5 QR Scanner

### Backend

* Java 17
* Spring Boot
* Spring Security
* Spring Data JPA
* PostgreSQL
* JWT Authentication
* MapStruct
* Lombok
* Swagger/OpenAPI

### Third-Party Services

* Razorpay
* Java Mail
* ZXing QR Generator

---

## 📁 Monorepo Structure

```text
.
├── frontend/
├── backend/
├── docs/
│   └── screenshots/
└── README.md
```

---

## ⚙️ Environment Setup

### Backend

```bash
cd backend
```

Create:

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

MAIL_USERNAME=
MAIL_PASSWORD=
```

Run:

```bash
./mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 📚 API Documentation

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

---

## 🎫 Ticket Purchase Flow

```text
Browse Event
      ↓
Select Ticket
      ↓
Razorpay Checkout
      ↓
Payment Verification
      ↓
Ticket Generation
      ↓
QR Code Creation
```

---

## ✅ Ticket Validation Flow

```text
Scan QR Code
      ↓
Verify Ticket
      ↓
Check Usage Status
      ↓
Allow / Reject Entry
```

---


## ▶️ Running the Application

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/event-ticket-management.git
cd event-ticket-management
```

---

### 2. Start PostgreSQL

Create a database:

```sql
CREATE DATABASE event_management;
```

Update the database configuration in the backend environment settings.

---

### 3. Configure Backend Environment

Add the required database, JWT, Razorpay, and email credentials.

Example:

```env
DB_URL=jdbc:postgresql://localhost:5432/event_management
DB_USERNAME=postgres
DB_PASSWORD=password

JWT_SECRET=your-secret-key

RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret

MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
```

---

### 4. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend will start on:

```text
http://localhost:8080
```

Swagger Documentation:

```text
http://localhost:8080/swagger-ui/index.html
```

---

### 5. Run the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on:

```text
http://localhost:5173
```

---

### 6. Access the Application

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:8080
```

Swagger API Docs:

```text
http://localhost:8080/swagger-ui/index.html
```
## 🐳 Docker

```bash
docker-compose up --build
```

---

## 🧪 Testing

Backend:

```bash
./mvnw test
```

Frontend:

```bash
npm run build
```

---

## 👨‍💻 Author

Akshit Saini

---
