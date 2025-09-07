# MovieBooking API

A clean and modular backend API for a movie booking system, built with Node.js and Express.

---

##  Table of Contents
- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running the Application](#running-the-application)  
- [Project Structure](#project-structure)  
- [API Endpoints](#api-endpoints)  
- [Contributing](#contributing)  
- [License](#license)

---

## Overview

This repository contains the backend API for a movie booking system. It handles essential functionalities such as user registration, movie browsing, seat booking, and more.

---

## Features

- User authentication (signup & login)  
- CRUD operations for movies and bookings  
- Versioned routing (`routes/v1`)  
- Modular architecture with controllers and models

---

## Tech Stack

| Component         | Technology         |
|------------------|--------------------|
| Backend runtime  | Node.js            |
| Framework        | Express.js         |
| Language         | JavaScript (ES6+)  |
| Package manager  | npm                |
| Architecture     | MVC / modular      |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v14+)
- [npm](https://www.npmjs.com/) (v6+)
- A working database (e.g., MongoDB, PostgreSQL)—configure via environment variables

### Installation
```bash
# Clone the repository
git clone https://github.com/ashishajce/moviebooking.git

# Navigate into the project directory
cd moviebooking

# Install dependencies
npm install
