EcoRide – Eco-Friendly Carpooling & Route-Sharing System 🚗🌱

EcoRide is a full-stack web-based ride-sharing and carpooling system designed to promote eco-friendly commuting.
The system allows users to offer rides, search for rides, book seats, manage profiles, and view bookings — along with an admin panel for system monitoring.

🚀 Features

👤 User Features
	
  •	User registration & login
	•	Email verification via secure token
	•	Offer a ride
	•	Search for rides
	•	Book seats
	•	View all booked rides
	•	View all offered rides
	•	Edit profile
	•	Secure JWT-based authentication

🛠 Admin Features
	•	Admin login
	•	Manage users
	•	Manage rides
	•	Database updates & consistency checks


🧱 Tech Stack

Frontend
	•	HTML
	•	CSS
	•	JavaScript
	•	Leaflet.js (Map & Location Rendering)

Backend
	•	Node.js
	•	Express.js
	•	MongoDB
	•	Mongoose
	•	Nodemailer (Email verification)

Tools & APIs
	•	Ngrok (Public URL for email verification)
	•	Gmail App Password
	•	GitHub Version Control


🔧 Environment Variables (.env)

PORT=5008
MONGO_URI=mongodb://127.0.0.1:27017/ecoride
JWT_SECRET=your_jwt_secret_here

BASE_URL=http://localhost:5008
FRONTEND_URL=http://localhost:5008

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

📬 Email Verification Setup

EcoRide uses Nodemailer + Gmail App Password to send verification links.

Steps:
	1.	Create a Gmail App Password
	2.	Add it to .env
	3.	Use Ngrok to expose the backend
	4.	Verification link is sent to the user
	5.	User clicks link → Email gets verified
  
  🛠 How to Run the Project

1️⃣ Install dependencies
cd Ecoride
npm install
cd backend
npm install
2️⃣ Start MongoDB
mongod
3️⃣ Start 
node server.js
