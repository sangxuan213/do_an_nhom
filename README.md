# 🚗 CarWash Pro - Smart Automated Car Wash Management System

A full-stack car wash management system with advance booking and loyalty program.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Backend | Java 17 + Spring Boot 3 |
| Security | Spring Security + JWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA + Hibernate |

## Project Structure

```
do_an_nhom/
├── backend/     → Spring Boot REST API (port 8080)
├── frontend/    → React SPA (port 3000, proxied to backend)
└── README.md
```

## Prerequisites

- **Java 17+** (JDK)
- **Node.js 18+** & npm
- **PostgreSQL 15+**
- **Maven 3.9+**

## Getting Started

### 1. Database Setup

```sql
CREATE DATABASE carwash_db;
```

### 2. Backend

```bash
cd backend
# Update src/main/resources/application.yml with your DB credentials
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000` with API calls proxied to the backend.

## Features

- 🔐 **JWT Authentication** - Secure login with role-based access (Customer/Admin)
- 📅 **Advance Booking** - Select services, view time slots, book appointments
- ⭐ **Loyalty Program** - Earn points, tier system (Bronze/Silver/Gold), redeem discounts
- 📊 **Admin Dashboard** - Manage bookings, users, and machine statuses
- 🤖 **IoT Mock** - Real-time washing machine status monitoring

## API Endpoints (Preview)

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login & receive JWT |
| GET | `/api/services` | List service packages |
| GET | `/api/bookings/slots` | Available time slots |
| POST | `/api/bookings` | Create booking |
| GET | `/api/loyalty/profile` | Loyalty points & tier |
| GET | `/api/admin/bookings` | All bookings (admin) |
| GET | `/api/admin/machines` | Machine statuses (admin) |
