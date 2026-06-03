FROM node:20-bookworm-slim as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install

COPY ./ /app/
ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.27-alpine
#Copy ci-dashboard-dist
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html
#Copy default nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
