#FROM openjdk:19
#
#COPY target/lfsg-0.0.1-SNAPSHOT.jar app.jar
#
#ENTRYPOINT ["java", "-jar", "/app.jar"]


FROM openjdk:19
VOLUME /tmp
EXPOSE 8082
ARG JAR_FILE=server/target/lfsg-0.0.1-SNAPSHOT.jar
ADD ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]