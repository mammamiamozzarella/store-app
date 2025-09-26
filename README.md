# Online Clothing Store

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Starting the Application](#starting-the-application)
4.[Running Tests](#running-tests)
5.[API Endpoints](#api-endpoints)
5.1 [Categories API](#categories-api)
5.2 [Products API](#products-api)
5.3 [Users API](#users-api)
5.4. [Quote API](#quote-api)
5.5. [Orders API](#orders-api)

---

## Overview

This API is part of the LABA internship from Solvd.

**Online Clothing Store** is a RESTful API designed to manage an online clothing store.
It allows users to:

- search for clothing items by size and additional filters
- view a list of available products that match the search criteria.
- create an account, log in, and manage their profile.

## Setup

### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/mammamiamozzarella/store-app.git
   cd <your-project-folder>
   ```
2. **Copy the example file and update it with your values:**
    ```bash
    cp .env.example .env
    ```
3. **Build the application image**
   ```bash
   docker build -t store-app .
    ```
4. **Start the services (Postgres + App)**
    ```bash
    docker-compose up -d
    ```
5. **Run database migrations**
    ```bash
    docker compose exec app node runMigrations.js
    ```
## Running Tests

To run the tests, execute the following command:
   ```bash
   docker compose exec app npm test
   ```
## Starting the Application

To start the application, run:
   ```bash
   docker compose up -d
   ```

## API Endpoints

### Categories API
1. Create a new category
- **Endpoint:** `POST /api/v1/categories`
- **Access:** Admin only
- **Body:**
```json
   {
     "name": "Electronics",
     "description": "Gadgets and electronic devices"
   }
```
- **Response:**
```json
   {
     "id": 1,
     "name": "Electronics",
     "description": "Gadgets and electronic devices",
     "createdAt": "2023-10-01T12:00:00Z",
     "updatedAt": "2023-10-01T12:00:00Z"
   }
```
- **Error Responses:**
   - `400 Bad Request`: name is required, description is required
   - `401 Unauthorized`: Access denied. Admins only
  
2. Get all categories
- **Endpoint:** `GET /api/v1/categories`
- **Access:** Public
- **Response:**
```json
   [
     {
       "id": 1,
       "name": "Electronics",
       "description": "Gadgets and electronic devices",
       "createdAt": "2023-10-01T12:00:00Z",
       "updatedAt": "2023-10-01T12:00:00Z"
     },
     {
       "id": 2,
       "name": "Clothing",
       "description": "Apparel and accessories",
       "createdAt": "2023-10-01T12:05:00Z",
       "updatedAt": "2023-10-01T12:05:00Z"
     }
   ]
```

3. Get a category by ID
- **Endpoint:** `GET /api/v1/categories/:id`
- **Access:** Public
- **Parameters:**
   - `id` (path parameter): ID of the category to retrieve
- **Response:**
```json
   {
   "id": 1,
   "name": "Electronics",
   "description": "Gadgets and electronic devices",
   "createdAt": "2023-10-01T12:00:00Z",
   "updatedAt": "2023-10-01T12:00:00Z",
   "products": [
      {
         "id": 1,
         "name": "Smartphone",
         "description": "Latest model smartphone",
         "price": 699.99,
         "sizes": [
            "S",
            "M",
            "L"
         ],
         "colors": [
            "Black",
            "White"
         ],
         "createdAt": "2023-10-01T12:10:00Z",
         "updatedAt": "2023-10-01T12:10:00Z"
      }
   ]
}
```

4. Update a category
- **Endpoint:** `PATCH /api/v1/categories/:id`
- **Access:** Admin only
- **Parameters:**
   - `id` (path parameter): ID of the category to update
- **Body:**
``json
   {
     "name": "Updated Electronics",
     "description": "Updated description"
   }
```
- **Response:**
```json
   {
     "id": 1,
     "name": "Updated Electronics",
     "description": "Updated description",
     "createdAt": "2023-10-01T12:00:00Z",
     "updatedAt": "2023-10-01T12:30:00Z"
   }
```

5. Delete a category
- **Endpoint:** `DELETE /api/v1/categories/:id`
- **Access:** Admin only
- **Parameters:**
   - `id` (path parameter): ID of the category to delete
- **Response:**
    - `200 Category deleted`

### Products API

1. Create a new product
- **Endpoint:** `POST /api/v1/products`
- **Access:** Admin only
- **Body:**
```json
   {
   "name": "Smartphone",
   "description": "Latest model smartphone",
   "price": 699.99,
   "categoryId": 1,
   "attributes": [
      {
         "attribute_name": "color",
         "attribute_value": "black"
      },
      {
         "attribute_name": "memory",
         "attribute_value": "128GB"
      }
   ]
}
```

2. Get all products
- **Endpoint:** `GET /api/v1/products`
- **Access:** Public

3. Get a product by ID
- **Endpoint:** `GET /api/v1/products/:id`
- **Access:** Public
- **Parameters:**
   - `id` (path parameter): ID of the product to retrieve
- **Response:**
```json
   {
   "id": 1,
   "name": "Smartphone",
   "description": "Latest model smartphone",
   "price": 699.99,
   "categoryId": 1,
   "attributes": [
      {
         "attribute_name": "color",
         "attribute_value": "black"
      },
      {
         "attribute_name": "memory",
         "attribute_value": "128GB"
      }
   ],
   "createdAt": "2023-10-01T12:10:00Z",
   "updatedAt": "2023-10-01T12:10:00Z"
}
```

4. Update a product
- **Endpoint:** `PATCH /api/v1/products/:id`
- **Access:** Admin only
- **Parameters:**
   - `id` (path parameter): ID of the product to update
- **Body:**
```json
   {
   "name": "Updated Smartphone",
   "description": "Updated description",
   "price": 749.99
}
```

5. Delete a product
- **Endpoint:** `DELETE /api/v1/products/:id`
- **Access:** Admin only
- **Parameters:**
   - `id` (path parameter): ID of the product to delete

### Users API

1. Register a new user
- **Endpoint:** `POST /api/v1/users/register`
- **Access:** Public
- **Body**
```json
{
   "name": "Anna",
   "email": "anna@example.com",
   "password": "password123",
   "role": "customer"
}
```

2. Login
- **Endpoint:** `POST /api/v1/users/login`
- **Access:** Public

### Quote API

1. Get a quote/cart
- **Endpoint:** `GET /api/v1/quote`
- **Access:** Authenticated users only
- **Response:**
```json
   {
     "id": 1,
     "userId": 1,
     "items": [
       {
         "productId": 1,
         "quantity": 2,
         "price": 699.99
       }
     ],
     "total": 1399.98,
     "createdAt": "2023-10-01T12:00:00Z",
     "updatedAt": "2023-10-01T12:00:00Z"
   }
```

2. Add item to quote/cart
- **Endpoint:** `POST /api/v1/quote/add`
- **Access:** Authenticated users only
- **Body:**
```json
   {
     "productId": 1,
     "quantity": 2
   }
```

### Orders API

1. Get all customer`s orders
- **Endpoint:** `GET /api/v1/orders`
- **Access:** Authenticated users only
- **Response:**
```json
   [
     {
       "id": 1,
       "userId": 1,
       "items": [
         {
           "productId": 1,
           "quantity": 2,
           "price": 699.99
         }
       ],
       "total": 1399.98,
       "status": "pending",
       "createdAt": "2023-10-01T12:00:00Z",
       "updatedAt": "2023-10-01T12:00:00Z"
     }
   ]
```

2. Place an order
- **Endpoint:** `POST /api/v1/orders`
- **Access:** Authenticated users only
- **Description:** Places an order based on the current quote/cart

3. Update an order status
- **Endpoint:** `PATCH /api/v1/orders/:id`
- **Access:** Admin only
- **Parameters:**
   - `id` (path parameter): ID of the order to update
- **Body:**
```json
   {
     "status": "shipped"
   }
```