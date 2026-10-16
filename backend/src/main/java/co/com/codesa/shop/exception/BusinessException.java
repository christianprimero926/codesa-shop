package co.com.codesa.shop.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Getter
public class BusinessException extends RuntimeException {

    private final String code;
    private final HttpStatus status;
    private final transient Map<String, Object> details;

    public BusinessException(String code, HttpStatus status, String message) {
        this(code, status, message, null);
    }

    public BusinessException(String code, HttpStatus status, String message, Map<String, Object> details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}
