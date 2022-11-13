# BASE IMAGE with an alias #
FROM node:16.18.1-alpine3.15 as build
WORKDIR /app

# Install Angular CLI to run Build #
RUN npm install -g @angular/cli@14.2.6

# Copying the files and Angular build (for production)
COPY ./package.json .
RUN npm install
COPY . .
RUN ng build

# Copying the dist files onto NGINX
FROM nginx as runtime
COPY --from=build /app/dist/jworldcup-ui-an /usr/share/nginx/html
