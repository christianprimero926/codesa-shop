import { OrderTotals } from './order.model';

export type ApiErrorCode =
  | 'RECURSO_NO_ENCONTRADO'
  | 'CUPON_INVALIDO'
  | 'CUPON_VENCIDO'
  | 'CUPON_MONTO_MINIMO'
  | 'STOCK_INSUFICIENTE'
  | 'TOTAL_INCORRECTO'
  | 'CLIENTE_INCOMPLETO'
  | 'PEDIDO_INVALIDO'
  | 'SOLICITUD_INVALIDA'
  | 'METODO_NO_PERMITIDO'
  | 'ERROR_INTERNO';

/** Códigos propios del front para fallas que no traen cuerpo del backend. */
export type ClientErrorCode = 'SIN_CONEXION' | 'ERROR_DESCONOCIDO';

export type ErrorCode = ApiErrorCode | ClientErrorCode;

export interface StockErrorDetails {
  productId: number;
  available: number;
  requested: number;
}

export interface MinimumAmountDetails {
  minSubtotal: number;
  missing: number;
}

export interface ApiErrorBody {
  error: ApiErrorCode;
  message: string;
  details?: StockErrorDetails | MinimumAmountDetails | OrderTotals;
}

export interface AppError {
  code: ErrorCode;
  status: number;
  message: string;
  details?: ApiErrorBody['details'];
}
