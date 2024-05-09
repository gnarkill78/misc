FROM node:20
COPY . /app
WORKDIR /app
RUN npm install
RUN npm install express-session helmet
CMD "./start.sh"
