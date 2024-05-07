# syntax=docker/dockerfile:1
FROM python:3.9-alpine
WORKDIR /code
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8080
# Install curl for healthcheck
RUN apk add curl
RUN pip install flask
COPY . .
CMD ["flask", "run"]