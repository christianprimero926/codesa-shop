package co.com.codesa.shop.controller;

import co.com.codesa.shop.dto.response.CouponResponseDTO;
import co.com.codesa.shop.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/{code}")
    public ResponseEntity<CouponResponseDTO> checkCoupon(@PathVariable String code,
                                                         @RequestParam(required = false) Long subtotal) {
        return ResponseEntity.ok(couponService.checkCoupon(code, subtotal));
    }
}
