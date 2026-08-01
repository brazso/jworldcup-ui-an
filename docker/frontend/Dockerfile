# BASE IMAGE with an alias #
FROM node:22.21.0-alpine3.22 as build
WORKDIR /app
ARG RABBITMQ_JWORLDCUP_PASS

# Install Angular CLI to run Build #
RUN npm install -g @angular/cli@21.2.14

# Copying the files, updating worldcup password and running angular build (for production)
COPY ./package.json .
RUN npm install
COPY . .
RUN set -x; if [ -n "$RABBITMQ_JWORLDCUP_PASS" ]; then \
  sed -i "s/be_socket_passcode: \"jworldcup\"/be_socket_passcode: \"$RABBITMQ_JWORLDCUP_PASS\"/" /app/src/environments/environment.prod.ts; \
fi
RUN ng build

# Copying the dist files onto NGINX
FROM nginx as runtime
COPY --from=build /app/dist/jworldcup-ui-an/browser /usr/share/nginx/html

# Overwriting config file to support angular url mapping to index.html
COPY ./docker/frontend/default.conf /etc/nginx/conf.d/default.conf
