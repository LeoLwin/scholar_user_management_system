# User Management System

A robust backend REST API built with Node.js, Express, TypeScript, and Prisma ORM for managing users, roles, features, and permissions.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript.
- **Prisma ORM**: Next-generation Node.js and TypeScript ORM.
- **MariaDB / MySQL**: Relational database for persistent storage.
- **Bcrypt**: Library to help you hash passwords.
- **jsonwebtoken (JWT)**: For securely transmitting information between parties as a JSON object.

## Prerequisites

Before running the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- A running instance of MySQL or MariaDB

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone or Open the Repository

Navigate to your project folder in your terminal:
```bash
cd /path/to/userManagement
```

### 2. Install Dependencies

Install all the required packages defined in `package.json`:
```bash
npm install
```

### 3. Environment Variables Configuration

The project relies on environment variables. Ensure your `.env` file is properly configured. Here is an example of what it should look like based on your current setup:

```env
PORT=8000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=user_management_system

JWT_SECRET=your_super_secret_jwt_key

# Prisma Database connection URL
DATABASE_URL="mysql://username:password@hostname:3306/database_name"
DATABASE_USER="username"
DATABASE_PASSWORD="password"
DATABASE_NAME="database_name"
DATABASE_HOST="hostname"
DATABASE_PORT=3306
```
*(Make sure to update the credentials to match your actual database)*

### 4. Database Setup & Prisma Migration

Generate the Prisma client based on your schema:
```bash
npx prisma generate
```

*(Note: If you have Prisma migrations to run to create the tables, you would normally run `npx prisma migrate dev`. Since the database already exists or is managed externally, generating the client is the main step.)*

### 5. Seed the Database

Populate your database with the initial foundational data such as Features, Permissions, default Roles (Super Admin, Admin), and a default Super Admin user:

```bash
npx prisma db seed
```
**Default Super Admin Credentials (from seed):**
- **Email:** `admin@example.com`
- **Password:** `Admin@123`

### 6. Run the Development Environment

To run the project in development mode, you need to start two processes in separate terminal windows/tabs:

**Terminal 1: Compile TypeScript in watch mode**
This terminal will constantly monitor your `.ts` files and compile them into `.js` inside the `dist` folder.
```bash
npm run watch
```

**Terminal 2: Run the Express Server**
This terminal will use `nodemon` to run your compiled server and automatically restart it whenever changes are detected in the `dist` folder.
```bash
npm run dev
```

The server should now be running. You should see `Server is listening on http://localhost:8000` (or the port defined in your `.env`) in Terminal 2.

## API Endpoints Overview

- `POST /api/auth/login` - Authenticate a user and receive a JWT token.
- `POST /api/auth/verify-token` - Verify the validity of a JWT token.
- `POST /api/auth/refresh-token` - Refresh an existing valid JWT token.
- Routes under `/api/users/`, `/api/roles/`, `/api/features/`, and `/api/permissions/` are protected by authentication headers.

## Production Build

To build the project for production, you just need to compile the TypeScript files once (without watch mode) and run the resulting JavaScript file using Node. 

```bash
# Compile TypeScript to JavaScript
npx tsc

# Run the compiled code
node ./dist/server.js
```
