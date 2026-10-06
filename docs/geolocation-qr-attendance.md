# Zigex Geolocation & QR Attendance System: A Technical Breakdown

As a Computer Science student, understanding not just *how* to use a library, but the *first principles* of how systems work under the hood is critical. This document breaks down the Zigex Geolocation and QR Attendance system, moving from the fundamental concepts to our specific application flow.

---

## 1. System Thinking & Application Flow

At a high level, the Zigex attendance system solves a classic distributed trust problem: **How do we cryptographically and physically verify that a student attended an internship or program on a given day?**

We solve this using a two-factor verification system:
1. **Cryptographic Proof of Context (QR Code):** Proves the student is interacting with the correct attendance checkpoint (e.g., scanning the supervisor's screen).
2. **Physical Proof of Presence (Geolocation):** Proves the student's physical device is within the boundaries of the required location.

### The Application Flow

1. **Admin/Supervisor Setup:** When creating a Program or Internship, the admin toggles "Require On-Site Attendance Check-in", selects a point on a map, and sets a radius (e.g., 100 meters). This saves `geo_latitude`, `geo_longitude`, and `geo_radius_meters` to the Supabase database.
2. **Token Generation:** The supervisor opens the Attendance Generator page. The server generates a cryptographic token representing that specific internship/program.
3. **Student Scan (Client-Side):** The student opens their dashboard and launches the `AttendanceQRScanner`. The browser requests access to the device's GPS hardware via the Geolocation API.
4. **Data Transmission:** The scanner reads the QR code (extracting the token) and sends an API request to the Next.js server containing both the `token` and the `lat`/`lng` coordinates.
5. **Server-Side Verification:** The server action `scanAttendanceQR`:
   - Cryptographically verifies the token (ensuring it wasn't forged).
   - Queries the database for the internship/program's required coordinates.
   - Calculates the physical distance between the student's coordinates and the office's coordinates using the **Haversine formula**.
   - If the distance $\le$ the allowed radius, attendance is marked as valid and saved to the database.

---

## 2. QR Codes: From First Principles

### What is a QR Code Fundamentally?
A Quick Response (QR) code is a two-dimensional barcode. Fundamentally, it's a matrix of black and white squares (modules) that represent binary data (`0`s and `1`s). 

If you strip away the error correction, a QR code is essentially a visual string of data. When a phone camera scans a QR code, it looks for the three large squares in the corners (Position Detection Patterns) to orient the image, standardizes the perspective, and then reads the black/white grid, translating it back into text (usually a URL).

### Types of QR Systems
1. **Static QR Codes:** The data encoded inside the image never changes. If you encode "Hello World", the QR code will always read "Hello World".
2. **Dynamic QR Codes:** The data encoded inside the image is a short URL (e.g., `zigex.com/qr/123`). The server intercepts requests to that URL and redirects them to the actual destination. The destination can be changed on the server without changing the printed QR code.

### How it Works in Zigex
In Zigex, we are using **Cryptographically Signed Static QR Codes**. 
The URL encoded in the QR code looks like this:
`https://zigexconnect.com/attendance/scan?token=eyJ0eXAi...`

The `token` is a JSON object that has been **HMAC-signed** (Hash-based Message Authentication Code). 
We take a payload like `{"internshipId": "123", "type": "attendance"}` and run it through a cryptographic hashing function (SHA-256) along with a `SECRET_KEY` that only the server knows. 
This produces a signature. Both the data and the signature are encoded into the token.

**Why do this?** If a student tries to create their own fake QR code to log attendance for an internship they aren't part of, they can modify the data, but they *cannot* generate a valid signature without the `SECRET_KEY`. When the server receives the token, it recalculates the signature. If it doesn't match, the server rejects it.

---

## 3. Maps and GPS: From First Principles

### How GPS Works
The Global Positioning System (GPS) is a network of about 30 satellites orbiting the Earth. Each satellite continuously broadcasts a radio signal containing its exact position and the exact time the signal was sent (using an atomic clock).

Your phone's GPS receiver picks up signals from at least four satellites. By comparing the time the signal was sent to the time it was received, your phone calculates how far away each satellite is (Distance = Speed of Light $\times$ Time Delay). Using a mathematical concept called **Trilateration**, your phone calculates the exact intersection point of those distances on the surface of the Earth, yielding your Latitude and Longitude.

### The Browser Geolocation API
In our app, we use `navigator.geolocation.getCurrentPosition()`. This is a Web API that asks the operating system (iOS, Android, Windows) for the device's location.
The OS doesn't just use GPS; it uses **A-GPS (Assisted GPS)**. It combines data from:
1. GPS Satellites (highly accurate, but slow to connect indoors)
2. Nearby Wi-Fi networks (Apple and Google maintain massive databases of where specific Wi-Fi routers are located globally)
3. Cell tower triangulation

This allows the browser to return coordinates instantly, even indoors where satellite visibility is poor.

### How We Calculate Distance (The Haversine Formula)
Because the Earth is a sphere, you cannot use simple Pythagorean geometry ($a^2 + b^2 = c^2$) to calculate the distance between two GPS coordinates. 

Instead, our server uses the **Haversine Formula**, which calculates the shortest distance between two points on the surface of a sphere. In our code, we convert the latitudes and longitudes from degrees to radians, apply the Earth's radius (approx. 6,371 km), and calculate the straight-line distance in meters.

---

## 4. How They Work Together in Zigex

When an intern scans the attendance QR code, here is the chronological breakdown of how the two systems fuse:

1. **The Scan:** The camera optical layer reads the matrix of the QR code and decodes the URL and the cryptographic token.
2. **The Prompt:** The web application intercepts the URL and calls the Geolocation API. The browser pauses and asks the user: *"Zigex wants to use your location."*
3. **The Sensor Read:** Once granted, the OS aggregates Wi-Fi, Cell, and GPS data to pinpoint the intern's location (e.g., `Lat: 5.9631, Lng: 10.1591`).
4. **The Network Request:** The client sends the token (Proof of Context) and the coordinates (Proof of Presence) to the Next.js server via an RPC call.
5. **The Cryptographic Check:** The server hashes the token data with the `SECRET_KEY`. It matches. The server now trusts that the scan is legitimate.
6. **The Geographic Check:** The server queries Supabase for the office location. It runs the Haversine formula against the student's coordinates. The result is 42 meters.
7. **The Decision:** 42 meters $\le$ the 100-meter `geo_radius_meters` limit. The server approves the request and logs a timestamp to the database.

By combining cryptography (to prevent token forgery) and trilateration (to prevent remote check-ins), Zigex creates a secure, robust attendance system.
