# Installation Guide

Follow these steps to set up and run the Event Planner Website locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (v12+ recommended)
- [npm](https://www.npmjs.com/get-npm)

## Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/event-planner.git
   cd event-planner
2. **Install Dependencies**
   npm install
3. **Configure Firebase**
   Create a Firebase project at Firebase Console.

  Enable Firestore and Authentication for your project.
  
  Copy your Firebase configuration credentials.
  
  Create or update your Firebase configuration file (e.g., firebaseConfig.js) with your credentials.
4. **Run the Project Locally**
  npm start
5. **Run Unit Tests**
  npm test
