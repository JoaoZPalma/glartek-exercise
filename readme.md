# Project Setup & Run Guide

This project contains:  
- **Frontend** (Vite + React)  
- **Two nodejs backend services to emulate a cluster**  
- **Mongo Database**  
- **Service Receiver** for testing  

Follow the steps below to build and run the system.

---

## Prerequisites
- **Docker** & **Docker Compose** installed  
- **Node.js** & **npm** installed (for local package installation)  
- **Git** installed  
- **Internet connection** for pulling dependencies

---

## 💻 Setup (Linux & Windows)

1. **Navigate to the frontend folder** and install Vite:
   ```bash
   cd frontend
   npm install vite
   ```

2. **Return to the project root**:

   ```bash
   cd ..
   ```

3. **Build all services** with Docker Compose:

   ```bash
   docker compose build
   ```


4. **Start all services** with Docker Compose:

   ```bash
   docker compose up
   ```

5. **In a new terminal**, start the service receiver:

   ```bash
   cd service_receiver
   node main.js
   ```

6. **Test the system**:

   * Open the frontend in your browser at:

     ```
     http://localhost:3000
     ```
   * Fill **every field** in the form.
   * Set the **URI** to:

     ```
     https://YOUR-IP-ADDRESS:4000/api/task
     ```

     *(Replace `YOUR-IP-ADDRESS` with your machine’s IP, on Linux: `ip a | grep inet`, on Windows: `ipconfig`.)*
   * Add a JSON body, for example:

     ```json
     {"example": "cool"}
     ```


## 📝 Notes

* The Docker build for the frontend requires Vite to be present in `node_modules`. Installing it locally before running `docker compose up` avoids build issues (Its a really weird bug I don't understand it yet).
* The production frontend is built inside Docker and served via **nginx\:alpine**.
* The two backend services, database along with the frontend will all start together via Docker Compose.
* **Do not forget to fill every field** in the frontend form — incomplete data may cause requests to fail.
* The **service receiver** will log incoming requests to the console, allowing you to verify that the system is **working correctly**.

