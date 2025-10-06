FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install React Native CLI and Expo CLI
RUN npm install -g @react-native-community/cli expo-cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 8081 19000 19001 19002

# Start Metro bundler
CMD ["npm", "start"]