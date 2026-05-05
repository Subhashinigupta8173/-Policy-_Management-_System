package com.insurex.policy.service;

import com.insurex.policy.dto.request.ProductRequest;
import com.insurex.policy.dto.response.ProductResponse;
import com.insurex.policy.entity.InsuranceProduct;
import com.insurex.policy.exception.ResourceNotFoundException;
import com.insurex.policy.repository.InsuranceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final InsuranceProductRepository productRepository;

    public List<ProductResponse> listActive() {
        return productRepository.findAllByActiveTrue().stream()
                .map(this::toResponse).toList();
    }

    public ProductResponse findById(Long id) {
        return toResponse(findEntity(id));
    }

    public InsuranceProduct findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    public ProductResponse create(ProductRequest req) {
        InsuranceProduct product = InsuranceProduct.builder()
                .name(req.getName())
                .type(req.getType())
                .basePremium(req.getBasePremium())
                .description(req.getDescription())
                .minAge(req.getMinAge())
                .maxAge(req.getMaxAge())
                .coverageAmount(req.getCoverageAmount())
                .termsJson(req.getTermsJson())
                .active(req.isActive())
                .build();
        return toResponse(productRepository.save(product));
    }

    public ProductResponse update(Long id, ProductRequest req) {
        InsuranceProduct product = findEntity(id);
        product.setName(req.getName());
        product.setType(req.getType());
        product.setBasePremium(req.getBasePremium());
        product.setDescription(req.getDescription());
        product.setMinAge(req.getMinAge());
        product.setMaxAge(req.getMaxAge());
        product.setCoverageAmount(req.getCoverageAmount());
        product.setTermsJson(req.getTermsJson());
        product.setActive(req.isActive());
        return toResponse(productRepository.save(product));
    }

    private ProductResponse toResponse(InsuranceProduct p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .type(p.getType())
                .basePremium(p.getBasePremium())
                .description(p.getDescription())
                .minAge(p.getMinAge())
                .maxAge(p.getMaxAge())
                .coverageAmount(p.getCoverageAmount())
                .termsJson(p.getTermsJson())
                .active(p.isActive())
                .build();
    }
}
