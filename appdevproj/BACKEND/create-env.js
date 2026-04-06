// Script to create .env file
import fs from 'fs';

const envContent = `PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/lostAndFound?retryWrites=true&w=majority`;

fs.writeFileSync('.env', envContent);
console.log('.env file created successfully!');
console.log('IMPORTANT: Replace <username>, <password>, and <your-cluster-url> with your actual MongoDB Atlas credentials.'); 