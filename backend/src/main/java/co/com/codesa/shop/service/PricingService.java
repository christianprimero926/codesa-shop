package co.com.codesa.shop.service;

import co.com.codesa.shop.domain.Coupon;
import co.com.codesa.shop.dto.response.PricingResponseDTO;

public interface PricingService {

    String normalizeCouponCode(String code);

    boolean isExpired(Coupon coupon);

    long calculateShipping(long subtotal);

    long calculateDiscount(Coupon coupon, long subtotal);

    PricingResponseDTO calculate(long subtotal, Coupon coupon);
}
