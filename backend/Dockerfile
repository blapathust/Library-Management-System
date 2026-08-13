FROM gradle:8.5-jdk17-alpine AS build
WORKDIR /app
COPY build.gradle .
COPY settings.gradle .
COPY src src

# Build the application using system gradle
RUN gradle build -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
