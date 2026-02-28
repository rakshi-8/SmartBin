# 🗑️ PRODUCT REQUIREMENT DOCUMENT (PRD)

# Smart Dustbins -- IoT Based Waste Management System

## 1️⃣ Product Overview

### Product Name:

SmartBin -- IoSmart Waste Monitoring System

### Vision:

Create a clean, overflow-free city by installing IoT-enabled smart
dustbins that:

-   Detect garbage fill levels
-   Send real-time alerts at 80% capacity
-   Show live status on dashboard
-   Optimize garbage truck routes
-   Reduce manual inspection

### Target Locations:

-   Temple areas (e.g., Meenakshi Amman Temple area)
-   Markets
-   Bus stands
-   Railway stations
-   Festival zones

------------------------------------------------------------------------

## 2️⃣ Problem Statement

### Current Issues:

-   Bins overflow before cleaning
-   Manual inspection required
-   No real-time visibility
-   Inefficient garbage truck routes
-   Bad smell & hygiene issues in crowded areas

### Impact:

-   Public health risks
-   Poor city image
-   Wasted fuel & manpower

------------------------------------------------------------------------

## 3️⃣ Product Objectives (SMART Goals)

  Objective                KPI
  ------------------------ ---------------------
  Reduce overflow          80% reduction
  Reduce inspection cost   50%
  Optimize route           30% fuel savings
  Real-time tracking       100% bin visibility

------------------------------------------------------------------------

## 4️⃣ Target Users

1.  Municipal Corporation Officials\
2.  Sanitation Supervisors\
3.  Garbage Truck Drivers\
4.  City Admin Dashboard Managers

------------------------------------------------------------------------

## 5️⃣ User Stories

### Municipal Officer

-   As an officer, I want to see which bins are full so that I can
    schedule cleaning efficiently.
-   As an officer, I want analytics reports to monitor cleanliness
    performance.

### Garbage Truck Driver

-   As a driver, I want optimized routes so that I save fuel and time.
-   As a driver, I want only full bins assigned to me.

### Sanitation Worker

-   As a worker, I want notification when bin crosses 80% so I can empty
    before overflow.

------------------------------------------------------------------------

## 6️⃣ Core Features

### 6.1 Smart Bin Hardware

-   Ultrasonic Sensor → Detect fill level
-   ESP8266 / ESP32 → Microcontroller
-   GSM / WiFi Module → Data transmission
-   Solar panel + battery power source
-   Optional: Gas sensor for foul smell detection

### 6.2 Fill Level Detection

-   0--50% → Green
-   50--80% → Yellow
-   80%+ → Red Alert
-   100% → Emergency alert

### 6.3 Real-Time Dashboard

-   Map view (Google Maps API)
-   Bin status (Green/Yellow/Red)
-   Fill percentage
-   Last emptied time
-   Bin ID & Area name

### 6.4 Alert System

-   80% full → Notification
-   SMS to supervisor
-   App notification
-   Email alert

### 6.5 Route Optimization

-   Auto-generate shortest route
-   Uses Google Maps API
-   Route suggestion to driver
-   Reduce unnecessary trips

### 6.6 Analytics & Reports

-   Daily fill trends
-   Area-wise garbage generation
-   Peak hour garbage analysis
-   Team performance reports

------------------------------------------------------------------------

## 7️⃣ Functional Requirements

  ID    Requirement
  ----- -----------------------------------
  FR1   Detect fill level every 5 minutes
  FR2   Transmit data to server
  FR3   Alert at 80% threshold
  FR4   Dashboard refresh every 1 minute
  FR5   Store 1 year historical data

------------------------------------------------------------------------

## 8️⃣ Non-Functional Requirements

  Type          Requirement
  ------------- -----------------------------
  Reliability   95% uptime
  Scalability   Support 10,000 bins
  Security      HTTPS encryption
  Performance   Alert latency \< 10 seconds

------------------------------------------------------------------------

## 9️⃣ System Architecture

Smart Bin → IoT Sensor → Microcontroller → Cloud Server → Database →
Dashboard → Route Engine → Driver App

------------------------------------------------------------------------

## 🔟 Tech Stack Recommendation

### Hardware

-   Ultrasonic Sensor (HC-SR04)
-   ESP32
-   SIM800L (GSM)
-   Solar Charging Module

### Backend

-   Node.js / Python (FastAPI)
-   MQTT Protocol
-   Firebase / AWS IoT Core

### Database

-   MongoDB (real-time data)
-   PostgreSQL (analytics)

### Frontend Dashboard

-   React.js
-   Google Maps API
-   Chart.js

### Driver App

-   Flutter
-   Firebase Cloud Messaging

------------------------------------------------------------------------

## 1️⃣1️⃣ Data Flow

1.  Sensor detects garbage level\
2.  ESP32 sends data via GSM/WiFi\
3.  Server stores data\
4.  If level ≥ 80% → Trigger alert\
5.  Route engine calculates best route\
6.  Driver receives notification

------------------------------------------------------------------------

## 1️⃣2️⃣ MVP Scope (Hackathon Version)

✔ 1--3 Smart Bins prototype\
✔ Real-time dashboard\
✔ 80% alert logic\
✔ Basic route suggestion\
❌ No AI prediction (future phase)

------------------------------------------------------------------------

## 1️⃣3️⃣ Future Enhancements

-   AI-based garbage prediction\
-   Auto-compacting bins\
-   CCTV integration\
-   Face recognition for littering\
-   Citizen reporting app

------------------------------------------------------------------------

## 1️⃣4️⃣ Business Model

### Revenue Streams:

-   Municipal contracts\
-   Subscription per bin (₹300--₹500/month)\
-   CSR partnerships\
-   Smart City funding

------------------------------------------------------------------------

## 1️⃣5️⃣ Risk Analysis

  Risk             Mitigation
  ---------------- ---------------------
  Sensor failure   Regular maintenance
  Network issue    GSM fallback
  Vandalism        Metal casing + lock
  Power failure    Solar backup

------------------------------------------------------------------------

## 1️⃣6️⃣ Impact

-   No overflow during festivals\
-   Clean environment\
-   Improved tourism image\
-   Reduced manpower dependency
