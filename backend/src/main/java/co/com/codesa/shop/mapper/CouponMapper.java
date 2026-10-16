package co.com.codesa.shop.mapper;

import co.com.codesa.shop.domain.Coupon;
import co.com.codesa.shop.dto.response.CouponResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class CouponMapper {

    public CouponResponseDTO toCouponResponse(Coupon coupon, boolean expired) {
        return CouponResponseDTO.builder()
                .code(coupon.getCode())
                .percent(coupon.getPercent())
                .minSubtotal(coupon.getMinSubtotal())
                .maxDiscount(coupon.getMaxDiscount())
                .expired(expired)
                .build();
    }
}
