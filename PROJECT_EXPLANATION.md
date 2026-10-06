# Railway Digital Twin & Decision Support System (DSS) - Project Explanation

This document provides a comprehensive overview of the technologies and architectural components used in the Railway DSS project. This can be used to explain the project structure and technical decisions to mentors or stakeholders.

## 1. Project Vision
The Railway DSS is an AI-powered management system designed to optimize railway section throughput and reduce delays using a combination of **Digital Twin** simulation and **Deep Reinforcement Learning (DRL)**.

---

## 2. Technology Stack & Component Roles

### **A. Backend ML Service (Python)**
*   **Technologies:** Python 3.9, FastAPI, PyTorch, Stable-Baselines3, Gymnasium, NumPy, Pandas, gRPC.
*   **Role:**
    *   **Digital Twin Engine:** A high-fidelity simulator that models the railway environment (tracks, signals, trains).
    *   **AI/DRL Agent:** Uses Deep Reinforcement Learning (Proximal Policy Optimization - PPO) to make real-time decisions on train scheduling and conflict resolution.
    *   **Simulation Engine:** Generates synthetic traffic scenarios to train and validate AI models.
    *   **FastAPI:** Provides lightweight REST endpoints for simulation control.

### **B. Enterprise API Gateway (Java)**
*   **Technologies:** Java 17, Spring Boot 3.x, Spring Data JPA, Spring WebSocket, gRPC, Lombok.
*   **Role:**
    *   **Central Coordinator:** Orchestrates communication between the frontend, the Python ML service, and the databases.
    *   **DSS Engine:** Implements business logic, safety rules (based on Indian Railway standards), and optimization heuristics.
    *   **Real-time Data Pipeline:** Ingests simulation state updates and broadcasts them to the frontend via WebSockets.
    *   **Persistence Layer:** Manages CRUD operations for master data (trains, track topology) and simulation history.

### **C. User Dashboard (React)**
*   **Technologies:** React 18, Redux, React Router, Chart.js, Tailwind CSS, Socket.io.
*   **Role:**
    *   **Real-time Visualization:** Displays live train movements on a schematic track map.
    *   **KPI Monitoring:** Visualizes performance metrics like throughput, average delay, and conflict avoidance rates using interactive charts.
    *   **Simulation Control Panel:** Allows users to configure "what-if" scenarios and trigger AI-driven optimizations.

### **D. Data & Infrastructure**
*   **PostgreSQL:**
    *   **Role:** Primary relational database for persistent storage of train records, schedules, track configurations, and historical simulation results.
*   **Redis:**
    *   **Role:** High-performance in-memory cache used for storing the "hot" state of the simulation (current train positions) and as a Pub/Sub message broker for real-time updates.
*   **Docker & Docker Compose:**
    *   **Role:** Containerization of all services to ensure consistent environments across development and deployment.
*   **gRPC:**
    *   **Role:** High-performance, low-latency communication protocol used for internal messaging between the Java and Python backend services.

---

## 3. How the System Works (The Flow)

1.  **Initialization:** The user sets up a simulation scenario on the **React Dashboard**.
2.  **Request Handling:** The **Java Backend** receives the request, validates it, and communicates with the **Python ML Service** via **gRPC**.
3.  **Simulation & Optimization:** The **Python Digital Twin** starts the simulation. In every step, the **DRL Agent** analyzes the state and recommends actions (e.g., speed changes, loop entry) to prevent conflicts.
4.  **Data Synchronization:** The simulation state is continuously written to **Redis** for speed and later persisted to **PostgreSQL** for analytics.
5.  **Real-time Feedback:** The **Java Backend** listens for state changes and pushes them to the **React Frontend** using **WebSockets**, allowing the user to see the optimization happening in real-time.

---

## 4. Key Engineering Highlights
*   **Hybrid Architecture:** Combines the AI/ML strengths of Python with the enterprise-grade stability and concurrency of Java.
*   **Multi-Agent System:** The AI is designed to manage multiple trains simultaneously as independent agents.
*   **Digital Twin approach:** Allows for safe testing of scheduling policies in a virtual environment before any real-world application.
*   **Indian Railway Standards:** Logic is aligned with specific safety and operational protocols used in the Indian Railway network.
