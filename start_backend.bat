@echo off
set "JAVA_HOME=c:\SOCIETRA ERP\tools\jdk\jdk-17.0.8.1+1"
set "MAVEN_HOME=c:\SOCIETRA ERP\tools\maven\fresh\apache-maven-3.9.6"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests
