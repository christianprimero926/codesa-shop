package co.com.codesa.shop.service;

import co.com.codesa.shop.dto.request.OrderRequestDTO;
import co.com.codesa.shop.dto.response.OrderResponseDTO;

public interface OrderService {

    OrderResponseDTO createOrder(OrderRequestDTO request);

    OrderResponseDTO getOrder(String number);
}
