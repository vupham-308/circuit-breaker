package com.example.order;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Chỉ cần khai báo interface: OpenFeign tự sinh code gửi HTTP sang product-service.
 * Gọi productFeignClient.getProduct(1) tương đương GET http://localhost:8081/products/1
 */
@FeignClient(name = "product-service", url = "${product.base-url}")
public interface ProductFeignClient {

    @GetMapping("/products/{id}")
    String getProduct(@PathVariable("id") Long id);
}
