FROM openjdk:19

COPY lfsg/target/lfsg-0.0.1-SNAPSHOT.jar lfsg-0.0.1-SNAPSHOT.jar

ENTRYPOINT ["java", "-jar", "/lfsg-0.0.1-SNAPSHOT.jar"]