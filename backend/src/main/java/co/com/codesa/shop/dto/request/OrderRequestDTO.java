package co.com.codesa.shop.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {

    private CustomerDTO customer;
    private String paymentMethod;
    private String couponCode;
    private List<ItemDTO> items;
    private Long total;

    @Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
    public static class CustomerDTO {
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String city;
    }

    @Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
    public static class ItemDTO {
        private Long productId;
        private Integer quantity;
    }
}
