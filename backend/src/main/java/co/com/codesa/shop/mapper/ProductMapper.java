package co.com.codesa.shop.mapper;

import co.com.codesa.shop.domain.Product;
import co.com.codesa.shop.dto.response.ProductResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponseDTO toProductResponse(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .brand(product.getBrand())
                .category(product.getCategory().getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .rating(product.getRating())
                .image(product.getImage())
                .description(product.getDescription())
                .build();
    }
}
