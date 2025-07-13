To Run the code 
Step 1: Install node modules 

cd frontend > npm install
cd backend > npm install

include .env in backend folder 

.env 
<------Start of the File-------->

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/logistics-booking

# Server Configuration
PORT=5000

# Application Configuration
NODE_ENV=development


<-------End of the File------->


Then run code 

cd frontend > npm run dev

cd backend > npm start