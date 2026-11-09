# Resilience4j CircuitBreaker Demo

Demo minh hoạ **Circuit Breaker** trong kiến trúc microservices bằng **Spring Boot 3** và **Resilience4j**.

Hệ thống gồm 2 service:

```
Client ──► order-service (8080) ─── HTTP / JSON qua OpenFeign ───► product-service (8081)
             OrderController → Proxy (@CircuitBreaker) → ProductClient → ProductFeignClient
```

- **product-service** (cổng 8081): trả về thông tin sản phẩm.
- **order-service** (cổng 8080): gọi sang product-service bằng **OpenFeign** (HTTP REST, đồng bộ, dữ liệu JSON). Lời gọi được bọc bởi `@CircuitBreaker`; khi lỗi sẽ chạy hàm `fallback`.

Để tạo lỗi, ta **tắt product-service** rồi quan sát circuit breaker chuyển trạng thái **CLOSED → OPEN → HALF_OPEN → CLOSED**.

---

## Mục lục

1. [Yêu cầu](#1-yêu-cầu)
2. [Cấu trúc project](#2-cấu-trúc-project)
3. [Cài đặt và chạy](#3-cài-đặt-và-chạy)
4. [Các API](#4-các-api)
5. [Circuit breaker hoạt động thế nào](#5-circuit-breaker-hoạt-động-thế-nào)
6. [Cấu hình](#6-cấu-hình)
7. [Kịch bản demo](#7-kịch-bản-demo)
8. [Lỗi thường gặp](#8-lỗi-thường-gặp)
9. [Tài liệu tham khảo](#9-tài-liệu-tham-khảo)

---

## 1. Yêu cầu

| Công cụ | Phiên bản |
|---|---|
| JDK | 17 trở lên |
| Maven | 3.9 trở lên (hoặc Maven tích hợp sẵn trong IntelliJ IDEA) |
| curl / Postman / trình duyệt | để gọi API |

Kiểm tra:

```bash
java -version
mvn -version
```

## 2. Cấu trúc project

```
.
├── pom.xml                            # pom gốc, gom 2 service (packaging pom)
├── run-all.bat                        # chạy cả 2 service trên Windows
├── .run/                              # cấu hình chạy cho IntelliJ IDEA
├── README.md
├── demo-commands.txt                  # các lệnh curl dùng khi demo
├── product-service/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/product/
│       │   ├── ProductServiceApplication.java
│       │   └── ProductController.java
│       └── resources/application.properties
└── order-service/
    ├── pom.xml
    └── src/main/
        ├── java/com/example/order/
        │   ├── OrderServiceApplication.java   # @EnableFeignClients
        │   ├── OrderController.java
        │   ├── ProductClient.java             # @CircuitBreaker + fallback
        │   └── ProductFeignClient.java        # @FeignClient gọi product-service
        └── resources/application.properties
```

## 3. Cài đặt và chạy

Thư mục gốc có `pom.xml` (packaging `pom`) gom 2 module `product-service` và `order-service`, nên có thể mở và build cả hai một lần.

Lần chạy đầu Maven sẽ tải thư viện, mất vài phút.

### Cách 1: IntelliJ IDEA (một lần bấm)

1. `File → Open` → chọn **thư mục gốc** của project (nơi có `pom.xml` gốc). IntelliJ nhận cả 2 module.
2. Ở danh sách cấu hình chạy (góc trên bên phải), chọn **Run all services** → bấm Run. Cả 2 service khởi động cùng lúc, mỗi service một tab trong cửa sổ Run.

Muốn tắt riêng product-service khi demo: bấm nút Stop ở tab `ProductServiceApplication`.

### Cách 2: Windows, một lệnh

Nhấp đúp `run-all.bat` (hoặc chạy trong terminal tại thư mục gốc). File này mở 2 cửa sổ, mỗi cửa sổ chạy một service. Muốn tắt product-service: bấm Ctrl + C trong cửa sổ `product-service`.

### Cách 3: terminal, từng service

Mở **2 cửa sổ terminal** tại thư mục gốc:

```bash
# Terminal 1
mvn -pl product-service spring-boot:run
```

```bash
# Terminal 2
mvn -pl order-service spring-boot:run
```

Build cả 2 service một lần (không chạy): `mvn clean package` tại thư mục gốc.

> Không chạy `mvn spring-boot:run` ở thư mục gốc: pom gốc chỉ gom module, không phải ứng dụng Spring Boot. Luôn chỉ rõ module bằng `-pl`.

### Kiểm tra đã chạy được

```bash
curl http://localhost:8081/products/1
curl http://localhost:8080/orders/1
```

> **Windows PowerShell:** gõ `curl.exe` thay vì `curl` (trong PowerShell, `curl` là một lệnh khác).

## 4. Các API

| URL | Mô tả |
|---|---|
| `GET http://localhost:8081/products/{id}` | product-service: thông tin sản phẩm |
| `GET http://localhost:8080/orders/{id}` | order-service: gọi product qua circuit breaker (demo chính) |
| `GET http://localhost:8080/orders/{id}/noi-bo` | Demo lỗi 1: gọi nội bộ trong class |
| `GET http://localhost:8080/orders/{id}/fallback-sai` | Demo lỗi 2: fallback sai chữ ký |
| `GET http://localhost:8080/actuator/circuitbreakers` | Trạng thái và chỉ số của các mạch |
| `GET http://localhost:8080/actuator/circuitbreakerevents` | Lịch sử sự kiện (các lần lỗi, chuyển trạng thái) |
| `GET http://localhost:8080/actuator/health` | Health check, có mục `circuitBreakers` |

## 5. Circuit breaker hoạt động thế nào

### Ba trạng thái

| Trạng thái | Hành vi | Chuyển trạng thái khi |
|---|---|---|
| **CLOSED** | Bình thường, mọi request đi qua, đếm thành công / thất bại | Tỉ lệ lỗi ≥ ngưỡng → OPEN |
| **OPEN** | Chặn mọi request, ném `CallNotPermittedException`, chạy fallback | Hết thời gian chờ → HALF_OPEN |
| **HALF_OPEN** | Cho vài request đi qua để thử | Thử thành công → CLOSED; vẫn lỗi → OPEN |

### Luồng một request (mạch CLOSED)

1. Client gọi `GET /orders/1` tới `OrderController`.
2. `OrderController` gọi `productClient.getProduct(1)`. Bean nó nhận được thực chất là **proxy** do Spring tạo ra khi thấy `@CircuitBreaker`.
3. Proxy hỏi circuit breaker: mạch đang CLOSED nên cho đi tiếp.
4. Proxy gọi hàm `getProduct` thật trong `ProductClient`.
5. `ProductClient` gọi `ProductFeignClient`; OpenFeign gửi `GET /products/1` sang product-service.
6. product-service trả về JSON sản phẩm.
7. Proxy ghi nhận một lần thành công.
8. Kết quả trả về `OrderController`.
9. `OrderController` trả `{ orderId, product }` cho client.

- **Khi product-service tắt:** bước 5 bị lỗi kết nối; ở bước 7 proxy ghi nhận một lần thất bại rồi gọi `fallback`.
- **Khi mạch OPEN:** ở bước 3 proxy trả `fallback` ngay với `CallNotPermittedException`; các bước 4–7 không xảy ra.

### Giao tiếp giữa 2 service: OpenFeign

Chỉ cần khai báo một interface, OpenFeign tự sinh code gửi HTTP:

```java
@FeignClient(name = "product-service", url = "${product.base-url}")
public interface ProductFeignClient {
    @GetMapping("/products/{id}")
    String getProduct(@PathVariable("id") Long id);
}
```

`@EnableFeignClients` trên `OrderServiceApplication` bật tính năng này. Địa chỉ `product.base-url` khai báo trong `application.properties` (ghi cứng `localhost:8081`, không dùng Eureka). `@CircuitBreaker` đặt ở `ProductClient`, bọc quanh lời gọi Feign.

### Circuit breaker đặt ở đâu?

- **Ở phía gọi (order-service)**, để bảo vệ bên gọi khỏi bị kéo sập theo.
- **Mỗi service phụ thuộc dùng một instance riêng** (ví dụ `productService`, `paymentService`), để một service sập không làm chặn lời gọi sang service khác.

## 6. Cấu hình

Trong `order-service/src/main/resources/application.properties`. Ngoài các thuộc tính dưới đây còn có `product.base-url=http://localhost:8081` cho Feign.

| Thuộc tính | Giá trị demo | Mặc định | Ý nghĩa |
|---|---|---|---|
| `sliding-window-type` | COUNT_BASED | COUNT_BASED | Đo theo số lần gọi |
| `sliding-window-size` | 5 | 100 | Xét 5 lần gọi gần nhất |
| `minimum-number-of-calls` | 5 | 100 | Cần ít nhất 5 lần gọi mới tính tỉ lệ lỗi |
| `failure-rate-threshold` | 50 | 50 | Tỉ lệ lỗi ≥ 50% thì mở mạch |
| `wait-duration-in-open-state` | 10s | 60s | Thời gian ở OPEN trước khi cho gọi thử |
| `permitted-number-of-calls-in-half-open-state` | 2 | 10 | Số lần gọi thử ở HALF_OPEN |

Các giá trị được hạ thấp để thấy mạch chuyển trạng thái nhanh khi demo. Tên `productService` trong các thuộc tính phải khớp với `@CircuitBreaker(name = "productService")`.

## 7. Kịch bản demo

Nên mở song song 2 tab: một tab gọi `/orders/1`, một tab xem `/actuator/circuitbreakers`. Các lệnh có sẵn trong [`demo-commands.txt`](demo-commands.txt).

### 7.1 Demo chính

| Bước | Thao tác | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| 1 | Bật cả 2 service, gọi `/orders/1` | Dữ liệu sản phẩm thật | CLOSED |
| 2 | Tắt product-service (Ctrl + C), gọi `/orders/1` vài lần | Thông báo fallback kèm `RetryableException` (Feign không kết nối được) | CLOSED, số lỗi tăng dần |
| 3 | Gọi tiếp đến khi đủ 5 lần lỗi | Fallback kèm `CallNotPermittedException`: order-service không còn gọi sang product | OPEN |
| 4 | Bật lại product-service, chờ hơn 10 giây, gọi `/orders/1` 2 lần | Dữ liệu thật trả về như ban đầu | HALF_OPEN → CLOSED |

Tên exception trong thông báo fallback đổi từ `RetryableException` (lỗi kết nối) sang `CallNotPermittedException` (mạch đã mở, không gọi mạng nữa). Đó là bằng chứng mạch đã mở.

### 7.2 Demo 2 lỗi thường gặp

Bắt đầu khi mạch `productService` đã về CLOSED. Tắt lại product-service, sau đó:

| Bước | Gọi | Kết quả | Giải thích |
|---|---|---|---|
| 1 | `/orders/1` | Thông báo fallback | Hành vi đúng, để so sánh |
| 2 | `/orders/1/noi-bo` | **Lỗi 500**; số lần gọi của `productService` trên actuator **không tăng** | `getProductNoiBo()` gọi `this.getProduct()`: lời gọi không đi qua proxy nên `@CircuitBreaker` bị bỏ qua |
| 3 | `/orders/1/fallback-sai` | **Lỗi 500**; log của order-service có cảnh báo không tìm thấy fallback method | `fallbackSai(String id, ...)` không khớp với hàm gốc nhận `Long id` |

Cách sửa:

- **Lỗi 1:** gọi hàm có `@CircuitBreaker` từ một bean khác (như `OrderController` gọi `ProductClient`).
- **Lỗi 2:** fallback phải cùng kiểu trả về, cùng tham số với hàm gốc, thêm `Throwable` ở cuối.

### Reset để demo lại

Khởi động lại order-service để đưa mạch về trạng thái ban đầu.

## 8. Lỗi thường gặp

| Hiện tượng | Nguyên nhân / cách sửa |
|---|---|
| `Port 8080 was already in use` | Có chương trình khác đang dùng cổng. Tắt nó đi hoặc đổi `server.port` |
| `@CircuitBreaker` không có tác dụng | Thiếu `spring-boot-starter-aop` trong `pom.xml` |
| Mạch mãi không mở | `minimum-number-of-calls` quá lớn (mặc định 100) |
| Mạch không tự sang HALF_OPEN khi hết 10 giây | Hành vi mặc định: mạch chuyển khi có request mới đến. Muốn tự chuyển, bỏ dấu `#` ở dòng `automatic-transition-from-open-to-half-open-enabled=true` |
| Lỗi 404, 400 cũng làm mạch mở | Mặc định mọi exception đều tính là lỗi. Dùng `ignore-exceptions` để bỏ qua `feign.FeignException$FeignClientException` (lỗi 4xx của Feign) |
| `No qualifying bean of type ProductFeignClient` | Thiếu `@EnableFeignClients` trên class `OrderServiceApplication` |

## 9. Tài liệu tham khảo

- [Resilience4j – CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker)
- [Resilience4j – Getting started with Spring Boot 3](https://resilience4j.readme.io/docs/getting-started-3)
- [Spring Cloud OpenFeign](https://docs.spring.io/spring-cloud-openfeign/reference/)
- [Martin Fowler – CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html)
