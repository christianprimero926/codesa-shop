import { Injectable } from '@angular/core';

import { Customer, PaymentMethod } from '../../core/models/order.model';

const DRAFT_KEY = 'codesa-shop.checkout-draft';

export type CheckoutStep = 1 | 2;

export interface CheckoutDraft {
  customer: Customer;
  paymentMethod: PaymentMethod | null;
  step: CheckoutStep;
}

const CUSTOMER_FIELDS: readonly (keyof Customer)[] = [
  'fullName',
  'email',
  'phone',
  'address',
  'city',
];

/** Borrador del checkout en sessionStorage: un F5 no obliga a reescribir el formulario. */
@Injectable({ providedIn: 'root' })
export class CheckoutDraftService {
  load(): CheckoutDraft | null {
    try {
      const raw: unknown = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null');
      return this.read(raw);
    } catch {
      return null;
    }
  }

  save(draft: CheckoutDraft): void {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Sin sessionStorage el formulario sigue funcionando, solo no sobrevive a un F5.
    }
  }

  clear(): void {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nada que limpiar si el almacenamiento no está disponible.
    }
  }

  private read(raw: unknown): CheckoutDraft | null {
    if (typeof raw !== 'object' || raw === null) {
      return null;
    }
    const draft = raw as Record<string, unknown>;
    const customer = draft['customer'];
    if (typeof customer !== 'object' || customer === null) {
      return null;
    }
    const fields = customer as Record<string, unknown>;
    if (!CUSTOMER_FIELDS.every((field) => typeof fields[field] === 'string')) {
      return null;
    }
    const paymentMethod = draft['paymentMethod'];
    return {
      customer: {
        fullName: fields['fullName'] as string,
        email: fields['email'] as string,
        phone: fields['phone'] as string,
        address: fields['address'] as string,
        city: fields['city'] as string,
      },
      paymentMethod: paymentMethod === 'CARD' || paymentMethod === 'CASH' ? paymentMethod : null,
      step: draft['step'] === 2 ? 2 : 1,
    };
  }
}
