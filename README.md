# Lost and Found Application

A web application for managing lost and found items, built with Node.js, Express, and MongoDB.

## Features

- Post lost or found items with descriptions and images
- Search and filter items by status
- Mark items as claimed
- Mobile-responsive design

## Technology Stack

- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Docker & Render

## Local Development Setup

1. **Clone the repository**
   ```
   git clone <repository-url>
   ```

2. **Set up MongoDB**
   - Create a MongoDB Atlas account or use a local MongoDB instance
   - Create a database called "lostAndFound"

3. **Set up environment variables**
   - Create a `.env` file in the BACKEND directory with:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/lostAndFound?retryWrites=true&w=majority
   ```

4. **Install dependencies**
   ```
   cd BACKEND
   npm install
   ```

5. **Start the application**
   ```
   npm start
   ```

6. **Access the application**
   - Open a browser and go to http://localhost:5000

## Docker Deployment

1. **Build the Docker image**
   ```
   docker build -t lost-and-found-app -f Dockerfile/Dockerfile .
   ```

2. **Run the container**
   ```
   docker run -p 5000:5000 --env-file BACKEND/.env lost-and-found-app
   ```

## Render Deployment

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select "Docker" as the environment
   - Enter the following settings:
     - **Name:** lost-and-found-app (or your preferred name)
     - **Environment Variables:** Add your MONGO_URI
     - **Build Command:** N/A (uses Dockerfile)
     - **Start Command:** N/A (defined in Dockerfile)

2. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application

## Project Structure

- **BACKEND/**: Contains the Node.js/Express server
  - **controllers/**: API route handlers
  - **models/**: MongoDB schema definitions
  - **routes/**: API route definitions
  - **uploads/**: Uploaded images storage
  - **server.js**: Main server file

- **FRONTEND/**: Contains the web interface
  - **index.html**: Main frontend file with HTML, CSS, and JavaScript

- **Dockerfile/**: Contains Docker configuration
  - **Dockerfile**: Docker build configuration
  - **.dockerignore**: Files to exclude from Docker build 