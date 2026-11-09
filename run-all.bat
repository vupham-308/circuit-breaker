@echo off
rem Chay ca 2 service, moi service mot cua so rieng.
rem Chay file nay tai thu muc goc (noi co pom.xml goc).
cd /d "%~dp0"
start "product-service" cmd /k "mvn -pl product-service spring-boot:run"
start "order-service" cmd /k "mvn -pl order-service spring-boot:run"
