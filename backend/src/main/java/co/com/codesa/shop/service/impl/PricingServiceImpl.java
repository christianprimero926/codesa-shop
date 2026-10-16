package co.com.codesa.shop.service.impl;

import co.com.codesa.shop.domain.Coupon;
import co.com.codesa.shop.dto.response.PricingResponseDTO;
import co.com.codesa.shop.service.PricingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;

import static co.com.codesa.shop.utilities.Constants.FREE_SHIPPING_FROM;
import static co.com.codesa.shop.utilities.Constants.SHIPPING_COST;
import static co.com.codesa.shop.utilities.Constants.ZONE_ID;

@Service
public class PricingServiceImpl implements PricingService {

    @Override
    public String normalizeCouponCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    @Override
    public boolean isExpired(Coupon coupon) {
        return coupon.getExpiresAt() != null
                && coupon.getExpiresAt().isBefore(LocalDate.now(ZoneId.of(ZONE_ID)));
    }

    @Override
    public long calculateShipping(long subtotal) {
        return subtotal >= FREE_SHIPPING_FROM ? 0L : SHIPPING_COST;
    }

    @Override
    public long calculateDiscount(Coupon coupon, long subtotal) {
        if (coupon == null) {
            return 0L;
        }
        long discount = BigDecimal.valueOf(subtotal)
                .multiply(BigDecimal.valueOf(coupon.getPercent()))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP)
                .longValue();
        if (coupon.getMaxDiscount() != null) {
            discount = Math.min(discount, coupon.getMaxDiscount());
        }
        return discount;
    }

    @Override
    public PricingResponseDTO calculate(long subtotal, Coupon coupon) {
        long discount = calculateDiscount(coupon, subtotal);
        long shipping = calculateShipping(subtotal);
        return PricingResponseDTO.builder()
                .subtotal(subtotal)
                .discount(discount)
                .shipping(shipping)
                .total(subtotal - discount + shipping)
                .build();
    }
}
