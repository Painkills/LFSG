FROM openjdk:19

COPY server/target/lfsg-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "/server/app.jar"]