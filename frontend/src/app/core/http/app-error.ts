import { HttpErrorResponse } from '@angular/common/http';

import {
  ApiErrorBody,
  ApiErrorCode,
  AppError,
  ErrorCode,
  MinimumAmountDetails,
  StockErrorDetails,
} from '../models/api-error.model';
import { OrderTotals } from '../models/order.model';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  RECURSO_NO_ENCONTRADO: 'No encontramos lo que buscas. Puede que ya no exista.',
  CUPON_INVALIDO: 'Ese cupón no existe. Revisa que esté bien escrito.',
  CUPON_VENCIDO: 'Este cupón ya no está vigente.',
  CUPON_MONTO_MINIMO: 'Tu compra todavía no alcanza el monto mínimo de este cupón.',
  STOCK_INSUFICIENTE: 'No hay unidades suficientes de un producto de tu carrito.',
  TOTAL_INCORRECTO: 'Los precios cambiaron mientras comprabas. Actualizamos tu resumen.',
  CLIENTE_INCOMPLETO: 'Faltan datos de entrega. Revisa el formulario.',
  PEDIDO_INVALIDO: 'Tu pedido tiene cantidades no válidas. Revisa el carrito.',
  SOLICITUD_INVALIDA: 'No pudimos procesar la solicitud. Intenta de nuevo.',
  METODO_NO_PERMITIDO: 'No pudimos procesar la solicitud. Intenta de nuevo.',
  ERROR_INTERNO: 'Tuvimos un problema de nuestro lado. Intenta de nuevo en un momento.',
  SIN_CONEXION: 'No pudimos conectarnos con la tienda. Revisa tu conexión e intenta de nuevo.',
  ERROR_DESCONOCIDO: 'Algo salió mal. Intenta de nuevo en un momento.',
};

const API_ERROR_CODES = new Set<string>(
  Object.keys(ERROR_MESSAGES).filter((code) => code !== 'SIN_CONEXION'),
);

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  const code = (body as { error?: unknown }).error;
  return typeof code === 'string' && API_ERROR_CODES.has(code);
}

export function toAppError(response: HttpErrorResponse): AppError {
  if (isApiErrorBody(response.error)) {
    const code: ApiErrorCode = response.error.error;
    return {
      code,
      status: response.status,
      message: ERROR_MESSAGES[code],
      details: response.error.details,
    };
  }
  const code: ErrorCode =
    response.status === 0 || response.status >= 500 ? 'SIN_CONEXION' : 'ERROR_DESCONOCIDO';
  return { code, status: response.status, message: ERROR_MESSAGES[code] };
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'status' in value
  );
}

/** Garantiza un AppError aunque la falla no venga del interceptor. */
export function asAppError(value: unknown): AppError {
  if (isAppError(value)) {
    return value;
  }
  return { code: 'ERROR_DESCONOCIDO', status: 0, message: ERROR_MESSAGES.ERROR_DESCONOCIDO };
}

export function stockDetails(error: AppError): StockErrorDetails | null {
  const details = error.details;
  return error.code === 'STOCK_INSUFICIENTE' && details && 'available' in details ? details : null;
}

export function minimumAmountDetails(error: AppError): MinimumAmountDetails | null {
  const details = error.details;
  return error.code === 'CUPON_MONTO_MINIMO' && details && 'minSubtotal' in details
    ? details
    : null;
}

export function totalsDetails(error: AppError): OrderTotals | null {
  const details = error.details;
  return error.code === 'TOTAL_INCORRECTO' && details && 'total' in details ? details : null;
}
