package co.com.codesa.shop.repository;

import co.com.codesa.shop.domain.Product;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import static co.com.codesa.shop.utilities.ConstantsFields.ENTITY_BRAND;
import static co.com.codesa.shop.utilities.ConstantsFields.ENTITY_CATEGORY;
import static co.com.codesa.shop.utilities.ConstantsFields.ENTITY_NAME;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ProductSpecifications {

    public static Specification<Product> matchesText(String q) {
        if (q == null || q.isBlank()) {
            return null;
        }
        String pattern = "%" + q.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get(ENTITY_NAME)), pattern),
                cb.like(cb.lower(root.get(ENTITY_BRAND)), pattern));
    }

    public static Specification<Product> inCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        String name = category.trim().toLowerCase();
        return (root, query, cb) -> cb.equal(cb.lower(root.get(ENTITY_CATEGORY).get(ENTITY_NAME)), name);
    }
}
