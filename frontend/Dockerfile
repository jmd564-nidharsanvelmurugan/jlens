# --- Install dependencies & build ---
FROM node:22.12.0-alpine AS builder
WORKDIR /app

# Declare build arguments 
ARG VITE_API_URL 
ARG VITE_MSAL_CLIENT_ID 
ARG VITE_MSAL_TENANT_ID 
ARG VITE_MSAL_REDIRECT_URI 

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MSAL_CLIENT_ID=$VITE_MSAL_CLIENT_ID
ENV VITE_MSAL_TENANT_ID=$VITE_MSAL_TENANT_ID
ENV VITE_MSAL_REDIRECT_URI=$VITE_MSAL_REDIRECT_URI

# Copy package files and monorepo config
COPY package*.json turbo.json ./
 
# Copy app and packages
COPY apps ./apps
COPY packages ./packages
 
# Install all dependencies
RUN npm install
 
# Build the jlens Vite app
RUN npm run build --workspace=jlens
 
# --- Serve with nginx ---
FROM nginx:alpine
 
# Copy the Vite build output
COPY --from=builder /app/apps/jlens/dist /usr/share/nginx/html
 
# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Expose default port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]