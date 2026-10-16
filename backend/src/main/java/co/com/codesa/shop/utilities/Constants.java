package co.com.codesa.shop.utilities;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Constants {

    // ____ Codigos de error ____
    public static final String ERROR_NOT_FOUND = "RECURSO_NO_ENCONTRADO";
    public static final String ERROR_INVALID_ORDER = "PEDIDO_INVALIDO";
    public static final String ERROR_INCOMPLETE_CUSTOMER = "CLIENTE_INCOMPLETO";
    public static final String ERROR_INSUFFICIENT_STOCK = "STOCK_INSUFICIENTE";
    public static final String ERROR_INVALID_COUPON = "CUPON_INVALIDO";
    public static final String ERROR_EXPIRED_COUPON = "CUPON_VENCIDO";
    public static final String ERROR_COUPON_MIN_AMOUNT = "CUPON_MONTO_MINIMO";
    public static final String ERROR_WRONG_TOTAL = "TOTAL_INCORRECTO";
    public static final String ERROR_BAD_REQUEST = "SOLICITUD_INVALIDA";
    public static final String ERROR_METHOD_NOT_ALLOWED = "METODO_NO_PERMITIDO";
    public static final String ERROR_INTERNAL = "ERROR_INTERNO";

    // ____ Mensajes ____
    public static final String MSG_PRODUCT_NOT_FOUND = "No existe el producto con id %d";
    public static final String MSG_ORDER_NOT_FOUND = "No existe el pedido %s";
    public static final String MSG_RESOURCE_NOT_FOUND = "El recurso solicitado no existe";
    public static final String MSG_EMPTY_ORDER = "El pedido debe tener al menos un producto";
    public static final String MSG_ITEM_WITHOUT_PRODUCT = "Cada item del pedido debe indicar el producto";
    public static final String MSG_INVALID_QUANTITY = "La cantidad por producto debe estar entre 1 y %d";
    public static final String MSG_REQUIRED_FIELD = "El campo %s es obligatorio";
    public static final String MSG_INVALID_FIELD = "El campo %s no es válido";
    public static final String MSG_INSUFFICIENT_STOCK = "No hay stock suficiente para %s";
    public static final String MSG_INVALID_COUPON = "El cupón %s no existe";
    public static final String MSG_EXPIRED_COUPON = "El cupón %s está vencido";
    public static final String MSG_COUPON_MIN_AMOUNT = "El cupón %s requiere un subtotal mínimo de $%,d";
    public static final String MSG_WRONG_TOTAL = "El total enviado no coincide con el calculado, revisa tu carrito";
    public static final String MSG_BAD_REQUEST = "La solicitud no tiene un formato válido";
    public static final String MSG_METHOD_NOT_ALLOWED = "Método HTTP no permitido para este recurso";
    public static final String MSG_INTERNAL = "Ocurrió un error inesperado, intenta más tarde";

    // ____ Reglas de negocio ____
    public static final int MAX_UNITS_PER_LINE = 10;
    public static final long SHIPPING_COST = 12900L;
    public static final long FREE_SHIPPING_FROM = 200000L;
    public static final long TOTAL_TOLERANCE = 1L;
    public static final String ZONE_ID = "America/Bogota";
    public static final String ORDER_NUMBER_FORMAT = "ORD-%d-%04d";

    // ____ Catalogo ____
    public static final String SORT_PRICE = "price";
    public static final String SORT_NAME = "name";
    public static final String SORT_RATING = "rating";
    public static final String ORDER_DESC = "desc";
    public static final int MIN_PAGE_SIZE = 1;
    public static final int MAX_PAGE_SIZE = 48;

    // ____ Validaciones ____
    public static final String EMAIL_REGEX = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
    public static final String PHONE_REGEX = "^\\d{7,10}$";
}
