package co.com.codesa.shop.exception;

import co.com.codesa.shop.dto.response.ErrorResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

import static co.com.codesa.shop.utilities.Constants.ERROR_BAD_REQUEST;
import static co.com.codesa.shop.utilities.Constants.ERROR_INTERNAL;
import static co.com.codesa.shop.utilities.Constants.ERROR_METHOD_NOT_ALLOWED;
import static co.com.codesa.shop.utilities.Constants.ERROR_NOT_FOUND;
import static co.com.codesa.shop.utilities.Constants.MSG_BAD_REQUEST;
import static co.com.codesa.shop.utilities.Constants.MSG_INTERNAL;
import static co.com.codesa.shop.utilities.Constants.MSG_METHOD_NOT_ALLOWED;
import static co.com.codesa.shop.utilities.Constants.MSG_RESOURCE_NOT_FOUND;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponseDTO> handleBusiness(BusinessException ex) {
        log.warn("Error de negocio {}: {}", ex.getCode(), ex.getMessage());
        return build(ex.getStatus(), ex.getCode(), ex.getMessage(), ex.getDetails());
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMediaTypeNotSupportedException.class
    })
    public ResponseEntity<ErrorResponseDTO> handleBadRequest(Exception ex) {
        log.warn("Solicitud invalida: {}", ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, ERROR_BAD_REQUEST, MSG_BAD_REQUEST, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNoResource(NoResourceFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ERROR_NOT_FOUND, MSG_RESOURCE_NOT_FOUND, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethod(HttpRequestMethodNotSupportedException ex) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, ERROR_METHOD_NOT_ALLOWED, MSG_METHOD_NOT_ALLOWED, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception ex) {
        log.error("Error no controlado", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_INTERNAL, MSG_INTERNAL, null);
    }

    private ResponseEntity<ErrorResponseDTO> build(HttpStatus status, String code, String message, Map<String, Object> details) {
        ErrorResponseDTO body = ErrorResponseDTO.builder()
                .error(code)
                .message(message)
                .details(details)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
