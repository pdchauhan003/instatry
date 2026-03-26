# 1. Choose a base image. We are starting with a lightweight version of Node.js.
FROM node:18-alpine

# 2. Set the working directory INSIDE the container to /app
WORKDIR /app

# 3. Copy only the package.json files first (this helps with caching)
COPY package*.json ./

# 4. Install the dependencies inside the container
RUN npm install

# 5. Copy the rest of your application code from your computer into the container
COPY . .

# 6. Expose the port your app runs on (e.g., port 3000)
EXPOSE 3000

# 7. Define the command to run your app when the container starts
CMD ["node", "app.js"]
