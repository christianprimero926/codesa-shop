package co.com.codesa.shop.service.impl;

import co.com.codesa.shop.domain.Coupon;
import co.com.codesa.shop.domain.Order;
import co.com.codesa.shop.domain.OrderLine;
import co.com.codesa.shop.domain.OrderStatus;
import co.com.codesa.shop.domain.PaymentMethod;
import co.com.codesa.shop.domain.Product;
import co.com.codesa.shop.dto.request.OrderRequestDTO;
import co.com.codesa.shop.dto.response.OrderResponseDTO;
import co.com.codesa.shop.dto.response.PricingResponseDTO;
import co.com.codesa.shop.exception.BusinessException;
import co.com.codesa.shop.exception.NotFoundException;
import co.com.codesa.shop.mapper.OrderMapper;
import co.com.codesa.shop.repository.OrderRepository;
import co.com.codesa.shop.repository.ProductRepository;
import co.com.codesa.shop.service.CouponService;
import co.com.codesa.shop.service.OrderService;
import co.com.codesa.shop.service.PricingService;
import co.com.codesa.shop.validator.OrderValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static co.com.codesa.shop.utilities.Constants.ERROR_INSUFFICIENT_STOCK;
import static co.com.codesa.shop.utilities.Constants.ERROR_WRONG_TOTAL;
import static co.com.codesa.shop.utilities.Constants.MSG_INSUFFICIENT_STOCK;
import static co.com.codesa.shop.utilities.Constants.MSG_ORDER_NOT_FOUND;
import static co.com.codesa.shop.utilities.Constants.MSG_PRODUCT_NOT_FOUND;
import static co.com.codesa.shop.utilities.Constants.MSG_WRONG_TOTAL;
import static co.com.codesa.shop.utilities.Constants.ORDER_NUMBER_FORMAT;
import static co.com.codesa.shop.utilities.Constants.TOTAL_TOLERANCE;
import static co.com.codesa.shop.utilities.Constants.ZONE_ID;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_AVAILABLE;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_DISCOUNT;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_PRODUCT_ID;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_REQUESTED;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_SHIPPING;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_SUBTOTAL;
import static co.com.codesa.shop.utilities.ConstantsFields.DETAIL_TOTAL;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponService couponService;
    private final PricingService pricingService;
    private final OrderValidator orderValidator;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        orderValidator.validate(request);

        // Agrupa productos repetidos conservando el orden del carrito
        Map<Long, Integer> quantities = request.getItems().stream()
                .collect(Collectors.toMap(OrderRequestDTO.ItemDTO::getProductId,
                        OrderRequestDTO.ItemDTO::getQuantity, Integer::sum, LinkedHashMap::new));
        orderValidator.validateMergedQuantities(quantities);
        log.info("Creando pedido con {} lineas", quantities.size());

        // Bloquea los productos para descontar stock
        Map<Long, Product> products = productRepository.findAllForUpdate(quantities.keySet()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        quantities.keySet().stream()
                .filter(productId -> !products.containsKey(productId))
                .findFirst()
                .ifPresent(productId -> {
                    throw new NotFoundException(String.format(MSG_PRODUCT_NOT_FOUND, productId));
                });

        long subtotal = 0L;
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            Product product = products.get(entry.getKey());
            if (entry.getValue() > product.getStock()) {
                throw insufficientStock(product, entry.getValue());
            }
            subtotal += product.getPrice() * entry.getValue();
        }

        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponService.validateCoupon(request.getCouponCode(), subtotal);
        }

        PricingResponseDTO pricing = pricingService.calculate(subtotal, coupon);
        if (request.getTotal() != null && Math.abs(pricing.getTotal() - request.getTotal()) > TOTAL_TOLERANCE) {
            throw wrongTotal(pricing);
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneId.of(ZONE_ID)).truncatedTo(ChronoUnit.MICROS);
        Order order = Order.builder()
                .createdAt(now)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().trim().toUpperCase()))
                .couponCode(coupon != null ? coupon.getCode() : null)
                .customer(orderMapper.toCustomer(request.getCustomer()))
                .subtotal(pricing.getSubtotal())
                .discount(pricing.getDiscount())
                .shipping(pricing.getShipping())
                .total(pricing.getTotal())
                .build();

        quantities.forEach((productId, quantity) -> {
            Product product = products.get(productId);
            product.setStock(product.getStock() - quantity);
            order.addLine(OrderLine.builder()
                    .product(product)
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(quantity)
                    .lineTotal(product.getPrice() * quantity)
                    .image(product.getImage())
                    .build());
        });

        Order saved = orderRepository.saveAndFlush(order);
        saved.setNumber(String.format(ORDER_NUMBER_FORMAT, now.getYear(), saved.getId()));
        log.info("Pedido {} creado por un total de {}", saved.getNumber(), saved.getTotal());
        return orderMapper.toOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(String number) {
        return orderRepository.findByNumber(number.trim().toUpperCase())
                .map(orderMapper::toOrderResponse)
                .orElseThrow(() -> new NotFoundException(String.format(MSG_ORDER_NOT_FOUND, number)));
    }

    private BusinessException insufficientStock(Product product, int requested) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put(DETAIL_PRODUCT_ID, product.getId());
        details.put(DETAIL_AVAILABLE, product.getStock());
        details.put(DETAIL_REQUESTED, requested);
        return new BusinessException(ERROR_INSUFFICIENT_STOCK, HttpStatus.CONFLICT,
                String.format(MSG_INSUFFICIENT_STOCK, product.getName()), details);
    }

    private BusinessException wrongTotal(PricingResponseDTO pricing) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put(DETAIL_SUBTOTAL, pricing.getSubtotal());
        details.put(DETAIL_DISCOUNT, pricing.getDiscount());
        details.put(DETAIL_SHIPPING, pricing.getShipping());
        details.put(DETAIL_TOTAL, pricing.getTotal());
        return new BusinessException(ERROR_WRONG_TOTAL, HttpStatus.UNPROCESSABLE_ENTITY, MSG_WRONG_TOTAL, details);
    }
}
