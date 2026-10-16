package co.com.codesa.shop.service.impl;

import co.com.codesa.shop.domain.Product;
import co.com.codesa.shop.dto.response.PageResponseDTO;
import co.com.codesa.shop.dto.response.ProductResponseDTO;
import co.com.codesa.shop.exception.NotFoundException;
import co.com.codesa.shop.mapper.ProductMapper;
import co.com.codesa.shop.repository.ProductRepository;
import co.com.codesa.shop.repository.ProductSpecifications;
import co.com.codesa.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static co.com.codesa.shop.utilities.Constants.MAX_PAGE_SIZE;
import static co.com.codesa.shop.utilities.Constants.MIN_PAGE_SIZE;
import static co.com.codesa.shop.utilities.Constants.MSG_PRODUCT_NOT_FOUND;
import static co.com.codesa.shop.utilities.Constants.ORDER_DESC;
import static co.com.codesa.shop.utilities.Constants.SORT_NAME;
import static co.com.codesa.shop.utilities.Constants.SORT_PRICE;
import static co.com.codesa.shop.utilities.Constants.SORT_RATING;
import static co.com.codesa.shop.utilities.ConstantsFields.ENTITY_ID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final List<String> SORT_FIELDS = List.of(SORT_PRICE, SORT_NAME, SORT_RATING);

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ProductResponseDTO> searchProducts(String q, String category, String sort,
                                                               String order, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, MIN_PAGE_SIZE, MAX_PAGE_SIZE);
        String sortField = SORT_FIELDS.contains(sort) ? sort : SORT_NAME;
        Sort.Direction direction = ORDER_DESC.equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;

        // Desempate por id para que la paginacion sea estable
        Sort sorting = Sort.by(direction, sortField).and(Sort.by(Sort.Direction.ASC, ENTITY_ID));
        Specification<Product> spec = Specification.where(ProductSpecifications.matchesText(q))
                .and(ProductSpecifications.inCategory(category));

        log.info("Buscando productos q={} categoria={} pagina={}", q, category, safePage);
        Page<Product> result = productRepository.findAll(spec, PageRequest.of(safePage, safeSize, sorting));

        return PageResponseDTO.<ProductResponseDTO>builder()
                .items(result.getContent().stream().map(productMapper::toProductResponse).toList())
                .total(result.getTotalElements())
                .page(safePage)
                .size(safeSize)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProduct(Long id) {
        return productRepository.findWithCategoryById(id)
                .map(productMapper::toProductResponse)
                .orElseThrow(() -> new NotFoundException(String.format(MSG_PRODUCT_NOT_FOUND, id)));
    }
}
