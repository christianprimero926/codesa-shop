package co.com.codesa.shop.validator;

import co.com.codesa.shop.domain.PaymentMethod;
import co.com.codesa.shop.dto.request.OrderRequestDTO;
import co.com.codesa.shop.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static co.com.codesa.shop.utilities.Constants.EMAIL_REGEX;
import static co.com.codesa.shop.utilities.Constants.ERROR_INCOMPLETE_CUSTOMER;
import static co.com.codesa.shop.utilities.Constants.ERROR_INVALID_ORDER;
import static co.com.codesa.shop.utilities.Constants.MAX_UNITS_PER_LINE;
import static co.com.codesa.shop.utilities.Constants.MSG_EMPTY_ORDER;
import static co.com.codesa.shop.utilities.Constants.MSG_INVALID_FIELD;
import static co.com.codesa.shop.utilities.Constants.MSG_INVALID_QUANTITY;
import static co.com.codesa.shop.utilities.Constants.MSG_ITEM_WITHOUT_PRODUCT;
import static co.com.codesa.shop.utilities.Constants.MSG_REQUIRED_FIELD;
import static co.com.codesa.shop.utilities.Constants.PHONE_REGEX;
import static co.com.codesa.shop.utilities.ConstantsFields.FIELD_ADDRESS;
import static co.com.codesa.shop.utilities.ConstantsFields.FIELD_CITY;
import static co.com.codesa.shop.utilities.ConstantsFields.FIELD_CUSTOMER;
import static co.com.codesa.shop.utilities.ConstantsFields.FIELD_EMAIL;
import static co.com.codesa.shop.utilities.ConstantsFields.FIELD_FULL_NAME;
import static co.com.codesa.shop.utilities.ConstantsFields.FIELD_PAYMENT_METHOD;
import static co.com.codesa.shop.utilities.ConstantsFields.FIELD_PHONE;

@Component
public class OrderValidator {

    public void validate(OrderRequestDTO request) {
        validateCustomer(request.getCustomer());
        validatePaymentMethod(request.getPaymentMethod());
        validateItems(request.getItems());
    }

    public void validateMergedQuantities(Map<Long, Integer> quantities) {
        quantities.values().forEach(this::validateQuantity);
    }

    private void validateCustomer(OrderRequestDTO.CustomerDTO customer) {
        if (customer == null) {
            throw customerError(MSG_REQUIRED_FIELD, FIELD_CUSTOMER);
        }
        required(customer.getFullName(), FIELD_FULL_NAME);
        required(customer.getEmail(), FIELD_EMAIL);
        required(customer.getPhone(), FIELD_PHONE);
        required(customer.getAddress(), FIELD_ADDRESS);
        required(customer.getCity(), FIELD_CITY);

        if (!customer.getEmail().trim().matches(EMAIL_REGEX)) {
            throw customerError(MSG_INVALID_FIELD, FIELD_EMAIL);
        }
        if (!customer.getPhone().trim().matches(PHONE_REGEX)) {
            throw customerError(MSG_INVALID_FIELD, FIELD_PHONE);
        }
    }

    private void validatePaymentMethod(String paymentMethod) {
        required(paymentMethod, FIELD_PAYMENT_METHOD);
        boolean valid = Arrays.stream(PaymentMethod.values())
                .anyMatch(method -> method.name().equals(paymentMethod.trim().toUpperCase()));
        if (!valid) {
            throw customerError(MSG_INVALID_FIELD, FIELD_PAYMENT_METHOD);
        }
    }

    private void validateItems(List<OrderRequestDTO.ItemDTO> items) {
        if (items == null || items.isEmpty()) {
            throw new BusinessException(ERROR_INVALID_ORDER, HttpStatus.BAD_REQUEST, MSG_EMPTY_ORDER);
        }
        for (OrderRequestDTO.ItemDTO item : items) {
            if (item == null || item.getProductId() == null) {
                throw new BusinessException(ERROR_INVALID_ORDER, HttpStatus.BAD_REQUEST, MSG_ITEM_WITHOUT_PRODUCT);
            }
            validateQuantity(item.getQuantity());
        }
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity < 1 || quantity > MAX_UNITS_PER_LINE) {
            throw new BusinessException(ERROR_INVALID_ORDER, HttpStatus.BAD_REQUEST,
                    String.format(MSG_INVALID_QUANTITY, MAX_UNITS_PER_LINE));
        }
    }

    private void required(String value, String field) {
        if (value == null || value.isBlank()) {
            throw customerError(MSG_REQUIRED_FIELD, field);
        }
    }

    private BusinessException customerError(String message, String field) {
        return new BusinessException(ERROR_INCOMPLETE_CUSTOMER, HttpStatus.UNPROCESSABLE_ENTITY,
                String.format(message, field));
    }
}
