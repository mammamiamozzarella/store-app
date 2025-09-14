# Online Clothing Store

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. Summary

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
