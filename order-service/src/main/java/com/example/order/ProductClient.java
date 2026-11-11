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

}
