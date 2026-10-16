package co.com.codesa.shop.exception;

import org.springframework.http.HttpStatus;

import static co.com.codesa.shop.utilities.Constants.ERROR_NOT_FOUND;

public class NotFoundException extends BusinessException {

    public NotFoundException(String message) {
        super(ERROR_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }
}
