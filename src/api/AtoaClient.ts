import type { AtoaEnv, AtoaEnvironment } from '../types/environment';
import type { BankInstitution } from '../types/bank';
import type { CustomerDetails } from '../types/customer';
import type {
  PaymentRequestData,
  PaymentAuthResponse,
  PaymentAuthRequestBody,
  TransactionDetails,
} from '../types/payment';
import { parseTransactionDetails } from '../types/payment';
import { AtoaException } from '../types/error';
import { getBaseUrl, Endpoints, applyEnvParam } from './endpoints';

export class AtoaClient {
  private baseUrl: string;
  private env: AtoaEnv;

  constructor(env: AtoaEnv, environment: AtoaEnvironment = 'production') {
    this.env = env;
    this.baseUrl = getBaseUrl(environment);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const adjustedPath = applyEnvParam(path, this.env);
    const url = `${this.baseUrl}${adjustedPath}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (response.status === 502) {
          throw new AtoaException(
            'custom',
            "Sorry, we're currently down for maintenance. Please check back later."
          );
        }

        if (errorData && typeof errorData === 'object') {
          throw new AtoaException(
            'custom',
            (errorData as Record<string, unknown>).message as string ??
              'Unknown Error',
            (errorData as Record<string, unknown>).amount as number | undefined,
            (errorData as Record<string, unknown>).referenceId as
              | string
              | undefined,
            (errorData as Record<string, unknown>).time as string | undefined
          );
        }

        throw new AtoaException('custom', 'Unknown Error');
      }

      const data = (await response.json()) as T;

      if (data == null) {
        throw new AtoaException('noDataFound');
      }

      return data;
    } catch (error) {
      if (error instanceof AtoaException) {
        throw error;
      }

      // Network error
      throw new AtoaException(
        'custom',
        'Server is not reachable. Please verify your internet connection and try again'
      );
    }
  }

  async fetchInstitutions(searchTerm?: string): Promise<BankInstitution[]> {
    let endpoint: string = Endpoints.institutions;
    if (searchTerm && searchTerm.length > 0) {
      endpoint = `${endpoint}&search=${encodeURIComponent(searchTerm)}`;
    }
    return this.request<BankInstitution[]>('GET', endpoint);
  }

  async getPaymentDetails(
    paymentRequestId: string,
    customerDetails?: CustomerDetails
  ): Promise<PaymentRequestData> {
    const body: Record<string, unknown> = {
      data: paymentRequestId,
      source: 'EXTERNAL_MERCHANT',
    };
    if (customerDetails) {
      body.customerDetails = customerDetails;
    }

    return this.request<PaymentRequestData>(
      'POST',
      Endpoints.getPaymentDetails,
      body
    );
  }

  async getPaymentAuth(
    payRequestBody: PaymentAuthRequestBody
  ): Promise<PaymentAuthResponse> {
    return this.request<PaymentAuthResponse>(
      'POST',
      Endpoints.securedAuthUrl,
      payRequestBody as unknown as Record<string, unknown>
    );
  }

  async getPaymentStatus(
    paymentIdempotencyId: string
  ): Promise<TransactionDetails> {
    const endpoint = Endpoints.getPaymentStatus(paymentIdempotencyId);
    const raw = await this.request<Record<string, unknown>>('GET', endpoint);
    return parseTransactionDetails(raw);
  }
}
