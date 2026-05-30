# Sales Record Management System (SRMS)

**SalesPro Ltd** - Huye District, Southern Province, Rwanda

A full-stack web application for digitizing customer, product, and sales recording processes.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Recharts, React Router DOM, Axios
- **Backend:** Node.js, Express.js, Mongoose ODM
- **Database:** MongoDB
- **Authentication:** JWT with bcrypt password hashing

## Project Structure

```
├── backend-project/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth and error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── validators/     # Express-validator rules
│   ├── server.js       # Entry point
│   └── .env            # Environment variables
│
├── frontend-project/
│   ├── public/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   │   ├── common/ # Buttons, modals, tables, etc.
│   │   │   ├── layout/ # Sidebar, navbar, main layout
│   │   │   └── charts/ # Recharts components
│   │   ├── pages/      # Route pages
│   │   ├── services/   # Axios API service
│   │   ├── context/    # Auth context provider
│   │   └── utils/      # Helper functions
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
cd <project-folder>
```

### 2. Backend Setup

```bash
cd backend-project
npm install
```

Create a `.env` file (already provided) or update:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/SRMS
JWT_SECRET=Your_Secret_Key_Here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the backend server:

```bash
npm start
# or in development:
npm run dev
```

Server runs on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend-project
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

The frontend is configured with a proxy to `http://localhost:5000` for API requests.

### 4. MongoDB

Ensure MongoDB is running locally on port `27017`. The database `SRMS` will be created automatically when the application starts.

## API Endpoints

### Authentication
| Method | Endpoint            | Description    |
|--------|---------------------|----------------|
| POST   | /api/auth/register  | Register user  |
| POST   | /api/auth/login     | Login user     |
| GET    | /api/auth/me        | Get user info  |

### Customers
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /api/customers          | Get all customers   |
| GET    | /api/customers/:id      | Get customer by ID  |
| POST   | /api/customers          | Create customer     |

### Products
| Method | Endpoint               | Description        |
|--------|------------------------|--------------------|
| GET    | /api/products          | Get all products   |
| GET    | /api/products/:id      | Get product by ID  |
| POST   | /api/products          | Create product     |

### Sales
| Method | Endpoint          | Description    |
|--------|-------------------|----------------|
| GET    | /api/sales        | Get all sales  |
| GET    | /api/sales/:id    | Get sale by ID |
| POST   | /api/sales        | Create sale    |
| PUT    | /api/sales/:id    | Update sale    |
| DELETE | /api/sales/:id    | Delete sale    |

### Reports
| Method | Endpoint                  | Description            |
|--------|---------------------------|------------------------|
| GET    | /api/reports/dashboard    | Dashboard statistics   |
| GET    | /api/reports/daily        | Daily sales report     |
| GET    | /api/reports/weekly       | Weekly sales report    |
| GET    | /api/reports/monthly      | Monthly sales report   |

## Database Schema

### Collections

**Customers**
- customerNumber (String, unique)
- firstName (String)
- lastName (String)
- telephone (String)
- address (String)

**Products**
- productCode (String, unique)
- productName (String)
- quantitySold (Number)
- unitPrice (Number)

**Sales**
- invoiceNumber (String, unique)
- customerId (ObjectId → Customer)
- productId (ObjectId → Product)
- salesDate (Date)
- paymentMethod (String)
- quantityPurchased (Number)
- totalAmountPaid (Number, auto-calculated)

**Users**
- fullName (String)
- username (String, unique)
- password (String, hashed)

## Validation Rules

- Rwanda phone numbers: `+25078XXXXXXX`, `+25079XXXXXXX`, `078XXXXXXX`, `079XXXXXXX`
- Names: letters only
- Prices/quantities: positive numbers
- Sales date: cannot be in the future
- Invoice numbers: must be unique
- Password: minimum 6 characters

## ERD

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Customer   │       │     Sale     │       │   Product    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ PK: _id      │──┐    │ PK: _id      │    ┌──│ PK: _id      │
│ customerNum  │  └───►│ FK: customer │    │  │ productCode  │
│ firstName    │       │ FK: product  │◄───┘  │ productName  │
│ lastName     │       │ invoiceNum   │       │ quantitySold │
│ telephone    │       │ salesDate    │       │ unitPrice    │
│ address      │       │ paymentMethod│       └──────────────┘
└──────────────┘       │ qtyPurchased │
                       │ totalAmount  │
                       └──────────────┘

Relationships:
- Customer 1 ────→ Many Sales (one-to-many)
- Product  1 ────→ Many Sales (one-to-many)
- Each Sale belongs to one Customer and one Product
```

## Features

- JWT Authentication with secure password hashing
- CRUD operations for customers, products, and sales
- Auto-calculation of total amount (qty × unit price)
- Daily, weekly, and monthly sales reports
- Dashboard with statistics and charts
- Search and filter functionality
- Rwanda phone number validation
- Responsive design (mobile + desktop)
- Toast notifications
- Loading states and empty states
- Confirmation dialogs for delete operations
