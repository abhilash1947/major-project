# Multi-stage Dockerfile for Java Backend

# Build stage
FROM maven:3.8-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose ports
EXPOSE 8080 9090

# Run the application
CMD ["java", "-jar", "app.jar", "--server.port=8080"]