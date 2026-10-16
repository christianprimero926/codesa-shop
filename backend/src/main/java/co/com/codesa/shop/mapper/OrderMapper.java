package co.com.codesa.shop.mapper;

import co.com.codesa.shop.domain.Customer;
import co.com.codesa.shop.domain.Order;
import co.com.codesa.shop.domain.OrderLine;
import co.com.codesa.shop.dto.request.OrderRequestDTO;
import co.com.codesa.shop.dto.response.OrderResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public Customer toCustomer(OrderRequestDTO.CustomerDTO dto) {
        return Customer.builder()
                .fullName(dto.getFullName().trim())
                .email(dto.getEmail().trim().toLowerCase())
                .phone(dto.getPhone().trim())
                .address(dto.getAddress().trim())
                .city(dto.getCity().trim())
                .build();
    }

    public OrderResponseDTO toOrderResponse(Order order) {
        Customer customer = order.getCustomer();
        return OrderResponseDTO.builder()
                .id(order.getId())
                .number(order.getNumber())
                .createdAt(order.getCreatedAt())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .couponCode(order.getCouponCode())
                .customer(OrderResponseDTO.CustomerDTO.builder()
                        .fullName(customer.getFullName())
                        .email(customer.getEmail())
                        .phone(customer.getPhone())
                        .address(customer.getAddress())
                        .city(customer.getCity())
                        .build())
                .items(order.getLines().stream().map(this::toItemResponse).toList())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .shipping(order.getShipping())
                .total(order.getTotal())
                .build();
    }

    private OrderResponseDTO.ItemDTO toItemResponse(OrderLine line) {
        return OrderResponseDTO.ItemDTO.builder()
                .productId(line.getProduct().getId())
                .name(line.getProductName())
                .unitPrice(line.getUnitPrice())
                .quantity(line.getQuantity())
                .lineTotal(line.getLineTotal())
                .image(line.getImage())
                .build();
    }
}
