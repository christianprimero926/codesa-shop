package co.com.codesa.shop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponseDTO {

    private String code;
    private Integer percent;
    private Long minSubtotal;
    private Long maxDiscount;
    private boolean expired;
}
