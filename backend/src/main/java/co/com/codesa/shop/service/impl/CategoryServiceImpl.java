package co.com.codesa.shop.service.impl;

import co.com.codesa.shop.domain.Category;
import co.com.codesa.shop.repository.CategoryRepository;
import co.com.codesa.shop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static co.com.codesa.shop.utilities.ConstantsFields.ENTITY_NAME;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<String> getCategoryNames() {
        log.info("Consultando categorias");
        return categoryRepository.findAll(Sort.by(ENTITY_NAME)).stream()
                .map(Category::getName)
                .toList();
    }
}
