package co.com.codesa.shop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long id;
    private String number;
    private OffsetDateTime createdAt;
    private String status;
    private String paymentMethod;
    private String couponCode;
    private CustomerDTO customer;
    private List<ItemDTO> items;
    private Long subtotal;
    private Long discount;
    private Long shipping;
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
        private String name;
        private Long unitPrice;
        private Integer quantity;
        private Long lineTotal;
        private String image;
    }
}
