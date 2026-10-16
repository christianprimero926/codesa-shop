package co.com.codesa.shop.utilities;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ConstantsFields {

    // ____ Cliente ____
    public static final String FIELD_CUSTOMER = "cliente";
    public static final String FIELD_FULL_NAME = "nombre completo";
    public static final String FIELD_EMAIL = "correo";
    public static final String FIELD_PHONE = "teléfono";
    public static final String FIELD_ADDRESS = "dirección";
    public static final String FIELD_CITY = "ciudad";
    public static final String FIELD_PAYMENT_METHOD = "método de pago";

    // ____ Detalles de error ____
    public static final String DETAIL_PRODUCT_ID = "productId";
    public static final String DETAIL_AVAILABLE = "available";
    public static final String DETAIL_REQUESTED = "requested";
    public static final String DETAIL_MIN_SUBTOTAL = "minSubtotal";
    public static final String DETAIL_MISSING = "missing";
    public static final String DETAIL_SUBTOTAL = "subtotal";
    public static final String DETAIL_DISCOUNT = "discount";
    public static final String DETAIL_SHIPPING = "shipping";
    public static final String DETAIL_TOTAL = "total";

    // ____ Entidades ____
    public static final String ENTITY_ID = "id";
    public static final String ENTITY_NAME = "name";
    public static final String ENTITY_BRAND = "brand";
    public static final String ENTITY_CATEGORY = "category";
}
