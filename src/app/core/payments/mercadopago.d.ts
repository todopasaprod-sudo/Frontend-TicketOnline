// Type declarations for the MercadoPago JS SDK v2 (loaded from CDN)

interface MercadoPagoConstructorOptions {
  locale?: string;
}

interface OrderIdentification {
  type: string;
  number: string;
}

interface CardPaymentFormData {
  token: string;
  installments: number;
  payment_method_id: string;
  issuer_id: number;
  payer: {
    email: string;
    identification: OrderIdentification;
  };
}

interface BrickError {
  type: string;
  cause: string;
}

interface CardPaymentBrickSettings {
  initialization: { amount: number };
  callbacks: {
    onReady: () => void;
    onSubmit: (formData: CardPaymentFormData) => Promise<void>;
    onError: (error: BrickError) => void;
  };
}

interface MercadoPagoBrickController {
  unmount: () => void;
}

interface MercadoPagoBricksBuilder {
  create(
    brick: 'cardPayment',
    containerId: string,
    settings: CardPaymentBrickSettings
  ): Promise<MercadoPagoBrickController>;
}

interface MercadoPagoInstance {
  bricks(): MercadoPagoBricksBuilder;
}

declare class MercadoPago implements MercadoPagoInstance {
  constructor(publicKey: string, options?: MercadoPagoConstructorOptions);
  bricks(): MercadoPagoBricksBuilder;
}
