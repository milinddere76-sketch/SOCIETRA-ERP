@echo off
set "JAVA_HOME=c:\SOCIETRA ERP\tools\jdk\jdk-17.0.8.1+1"
set "PATH=%JAVA_HOME%\bin;%PATH%"
"c:\SOCIETRA ERP\tools\maven\apache-maven-3.9.4\bin\mvn.cmd" compile -DskipTests
