package co.com.codesa.shop.service;

import co.com.codesa.shop.domain.Coupon;
import co.com.codesa.shop.dto.response.CouponResponseDTO;

public interface CouponService {

    CouponResponseDTO checkCoupon(String code, Long subtotal);

    Coupon validateCoupon(String code, Long subtotal);
}
