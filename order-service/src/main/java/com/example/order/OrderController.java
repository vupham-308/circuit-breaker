package com.example.order;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    private final ProductClient productClient;

    public OrderController(ProductClient productClient) {
        this.productClient = productClient;
    }

    // Demo chính: gọi qua proxy, circuit breaker + fallback hoạt động đúng
    @GetMapping("/orders/{id}")
    public Map<String, Object> getOrder(@PathVariable Long id) {
        return Map.of("orderId", id, "product", productClient.getProduct(id));
    }

    // Demo lỗi 1: gọi nội bộ trong class
    @GetMapping("/orders/{id}/noi-bo")
    public Map<String, Object> noiBo(@PathVariable Long id) {
        return Map.of("orderId", id, "product", productClient.getProductNoiBo(id));
    }

    // Demo lỗi 2: fallback sai chữ ký
    @GetMapping("/orders/{id}/fallback-sai")
    public Map<String, Object> fallbackSai(@PathVariable Long id) {
        return Map.of("orderId", id, "product", productClient.getProductFallbackSai(id));
    }
}
