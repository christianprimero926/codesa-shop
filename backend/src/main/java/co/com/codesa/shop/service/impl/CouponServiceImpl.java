package co.com.codesa.shop.service.impl;

import co.com.codesa.shop.domain.Coupon;
import co.com.codesa.shop.dto.response.CouponResponseDTO;
import co.com.codesa.shop.exception.BusinessException;
import co.com.codesa.shop.mapper.CouponMapper;
import co.com.codesa.shop.repository.CouponRepository;
import co.com.codesa.shop.service.CouponService;
import co.com.codesa.shop.service.PricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import static co.com.codesa.shop.utilities.Constants.ERROR_COUPON_MIN_AMOUNT;
import static co.com.codesa.shop.utilities.Constants.ERROR_EXPIRED_COUPON;
import static co.com.codesa.shop.utilities.Constants.ERROR_INVALID_COUPON;
import static co.com.codesa.shop.utilities.Constants.MSG_COUPON_MIN_AMOUNT;
import static co.com.codesa.shop.utilities.Constants.MSG_EXPIRED_COUPON;
import static co.com.codesa.shop.utilities.Constants.MSG_INVALID_COUPON;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_MIN_SUBTOTAL;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_MISSING;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private static final Locale LOCALE_CO = Locale.of("es", "CO");

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;
    private final PricingService pricingService;

    @Override
    @Transactional(readOnly = true)
    public CouponResponseDTO checkCoupon(String code, Long subtotal) {
        Coupon coupon = validateCoupon(code, subtotal);
        return couponMapper.toCouponResponse(coupon, pricingService.isExpired(coupon));
    }

    @Override
    public Coupon validateCoupon(String code, Long subtotal) {
        String normalized = pricingService.normalizeCouponCode(code);
        log.info("Validando cupon {}", normalized);

        Coupon coupon = couponRepository.findById(normalized == null ? "" : normalized)
                .orElseThrow(() -> new BusinessException(ERROR_INVALID_COUPON, HttpStatus.UNPROCESSABLE_ENTITY,
                        String.format(MSG_INVALID_COUPON, normalized)));

        if (pricingService.isExpired(coupon)) {
            throw new BusinessException(ERROR_EXPIRED_COUPON, HttpStatus.UNPROCESSABLE_ENTITY,
                    String.format(MSG_EXPIRED_COUPON, coupon.getCode()));
        }

        if (subtotal != null && subtotal < coupon.getMinSubtotal()) {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put(DETAIL_MIN_SUBTOTAL, coupon.getMinSubtotal());
            details.put(DETAIL_MISSING, coupon.getMinSubtotal() - subtotal);
            throw new BusinessException(ERROR_COUPON_MIN_AMOUNT, HttpStatus.UNPROCESSABLE_ENTITY,
                    String.format(LOCALE_CO, MSG_COUPON_MIN_AMOUNT, coupon.getCode(), coupon.getMinSubtotal()),
                    details);
        }
        return coupon;
    }
}
