package com.example.order;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;

@Service
public class ProductClient {

    private final ProductFeignClient productFeignClient;

    public ProductClient(ProductFeignClient productFeignClient) {
        this.productFeignClient = productFeignClient;
    }

    /**
     * Gọi sang product-service qua OpenFeign, được bảo vệ bởi circuit breaker "productService"
     * (cấu hình trong application.properties).
     */
    @CircuitBreaker(name = "productService", fallbackMethod = "fallback")
    public String getProduct(Long id) {
        return productFeignClient.getProduct(id);
    }

    // Cùng kiểu trả về, cùng tham số với hàm gốc, thêm Throwable ở cuối.
    // Tên exception cho biết lý do: RetryableException = Feign không kết nối được (lỗi kết nối),
    // CallNotPermittedException = mạch đang OPEN nên không gọi sang product nữa.
    private String fallback(Long id, Throwable ex) {
        return "Sản phẩm tạm thời không khả dụng ("
                + ex.getClass().getSimpleName() + ")";
    }

    // ===== Demo lỗi 1: gọi nội bộ qua "this", @CircuitBreaker bị bỏ qua =====
    // Lời gọi this.getProduct() đi thẳng bên trong đối tượng, không qua proxy của Spring,
    // nên circuit breaker không chạy và fallback không được gọi.
    public String getProductNoiBo(Long id) {
        return this.getProduct(id);
    }

    // ===== Demo lỗi 2: fallback sai chữ ký (String thay vì Long) =====
    // Resilience4j không tìm thấy fallback khớp, ghi cảnh báo vào log và ném exception gốc.
    // Instance "demoLoi" không khai báo trong application.properties nên dùng cấu hình mặc định.
    @CircuitBreaker(name = "demoLoi", fallbackMethod = "fallbackSai")
    public String getProductFallbackSai(Long id) {
        return productFeignClient.getProduct(id);
    }

    private String fallbackSai(String id, Throwable ex) {
        return "Sẽ không bao giờ chạy tới đây";
    }
}
