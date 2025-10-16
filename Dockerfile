# Final stage for app image
FROM nginx

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
