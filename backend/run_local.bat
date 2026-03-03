@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "SPRING_PROFILES_ACTIVE=dev"
set "SPRING_DATASOURCE_USERNAME=admin"
set "SPRING_DATASOURCE_PASSWORD=password"
mvn spring-boot:run
