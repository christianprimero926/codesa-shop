package co.com.codesa.shop.service;

import co.com.codesa.shop.dto.response.PageResponseDTO;
import co.com.codesa.shop.dto.response.ProductResponseDTO;

public interface ProductService {

    PageResponseDTO<ProductResponseDTO> searchProducts(String q, String category, String sort, String order, int page, int size);

    ProductResponseDTO getProduct(Long id);
}
