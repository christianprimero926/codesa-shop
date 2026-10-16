package co.com.codesa.shop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingResponseDTO {

    private long subtotal;
    private long discount;
    private long shipping;
    private long total;
}
