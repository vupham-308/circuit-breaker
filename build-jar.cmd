cd /d "%~dp0"
call mvn clean package -DskipTests
if errorlevel 1 (
    echo BUILD LOI
    exit /b 1
)
echo.
echo Xong. Jar nam o:
echo   order-service\target\order-service-1.0.0.jar
echo   product-service\target\product-service-1.0.0.jar
