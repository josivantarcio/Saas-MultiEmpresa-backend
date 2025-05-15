import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AsaasService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly accessToken: string;

  constructor(private readonly configService: ConfigService) {
    // Get configuration from environment variables
    this.apiUrl = this.configService.get<string>('ASAAS_API_URL', 'https://sandbox.asaas.com/api/v3');
    this.apiKey = this.configService.get<string>('ASAAS_API_KEY');
    this.accessToken = this.configService.get<string>('ASAAS_ACCESS_TOKEN');
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'access_token': this.accessToken || this.apiKey,
    };
  }

  /**
   * Create a customer in Asaas
   */
  async createCustomer(customerData: {
    name: string;
    email: string;
    cpfCnpj?: string;
    phone?: string;
    mobilePhone?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    province?: string;
    postalCode?: string;
    externalReference?: string;
    notificationDisabled?: boolean;
    additionalEmails?: string;
    municipalInscription?: string;
    stateInscription?: string;
    observations?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/customers`,
        customerData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get a customer from Asaas by ID
   */
  async getCustomer(customerId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/customers/${customerId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Update a customer in Asaas
   */
  async updateCustomer(customerId: string, customerData: any) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/customers/${customerId}`,
        customerData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Create a payment in Asaas
   */
  async createPayment(paymentData: {
    customer: string;
    billingType: string;
    value: number;
    dueDate: Date;
    description?: string;
    externalReference?: string;
    installmentCount?: number;
    installmentValue?: number;
    discount?: any;
    interest?: any;
    fine?: any;
    postalService?: boolean;
    split?: any[];
    [key: string]: any;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payments`,
        {
          ...paymentData,
          dueDate: this.formatDate(paymentData.dueDate),
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get a payment from Asaas by ID
   */
  async getPayment(paymentId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/payments/${paymentId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get payments by customer ID
   */
  async getPaymentsByCustomer(customerId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/payments?customer=${customerId}`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Cancel a payment in Asaas
   */
  async cancelPayment(paymentId: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payments/${paymentId}/cancel`,
        {},
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Refund a payment in Asaas
   */
  async refundPayment(paymentId: string, refundData: { value?: number; description?: string }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payments/${paymentId}/refund`,
        refundData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Create a subscription in Asaas
   */
  async createSubscription(subscriptionData: {
    customer: string;
    billingType: string;
    value: number;
    nextDueDate: Date;
    cycle: string;
    description?: string;
    discount?: any;
    interest?: any;
    fine?: any;
    externalReference?: string;
    split?: any[];
    [key: string]: any;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/subscriptions`,
        {
          ...subscriptionData,
          nextDueDate: this.formatDate(subscriptionData.nextDueDate),
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get a subscription from Asaas by ID
   */
  async getSubscription(subscriptionId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/subscriptions/${subscriptionId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get subscriptions by customer ID
   */
  async getSubscriptionsByCustomer(customerId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/subscriptions?customer=${customerId}`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Update a subscription in Asaas
   */
  async updateSubscription(subscriptionId: string, subscriptionData: any) {
    try {
      // Format date if present
      if (subscriptionData.nextDueDate) {
        subscriptionData.nextDueDate = this.formatDate(subscriptionData.nextDueDate);
      }
      
      const response = await axios.post(
        `${this.apiUrl}/subscriptions/${subscriptionId}`,
        subscriptionData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Cancel a subscription in Asaas
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/subscriptions/${subscriptionId}/cancel`,
        {},
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get invoices from a subscription
   */
  async getSubscriptionInvoices(subscriptionId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/subscriptions/${subscriptionId}/payments`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Create a transfer in Asaas
   */
  async createTransfer(transferData: {
    value: number;
    walletId: string;
    description?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transfers`,
        transferData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Create an anticipation in Asaas
   */
  async createAnticipation(anticipationData: {
    payment: string;
    value: number;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/anticipations`,
        anticipationData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get account balance from Asaas
   */
  async getAccountBalance() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/finance/balance`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Process webhook notification from Asaas
   */
  processWebhook(event: string, data: any) {
    // Map event to handler method
    switch (event) {
      case 'PAYMENT_CREATED':
        return this.handlePaymentCreated(data);
      case 'PAYMENT_UPDATED':
        return this.handlePaymentUpdated(data);
      case 'PAYMENT_CONFIRMED':
        return this.handlePaymentConfirmed(data);
      case 'PAYMENT_RECEIVED':
        return this.handlePaymentReceived(data);
      case 'PAYMENT_OVERDUE':
        return this.handlePaymentOverdue(data);
      case 'PAYMENT_REFUNDED':
        return this.handlePaymentRefunded(data);
      case 'PAYMENT_DELETED':
        return this.handlePaymentDeleted(data);
      case 'PAYMENT_RESTORED':
        return this.handlePaymentRestored(data);
      case 'PAYMENT_REFUND_SCHEDULED':
        return this.handlePaymentRefundScheduled(data);
      case 'PAYMENT_DUNNING_RECEIVED':
        return this.handlePaymentDunningReceived(data);
      case 'PAYMENT_DUNNING_REQUESTED':
        return this.handlePaymentDunningRequested(data);
      case 'PAYMENT_BANK_SLIP_VIEWED':
        return this.handlePaymentBankSlipViewed(data);
      case 'PAYMENT_CHECKOUT_VIEWED':
        return this.handlePaymentCheckoutViewed(data);
      case 'SUBSCRIPTION_CREATED':
        return this.handleSubscriptionCreated(data);
      case 'SUBSCRIPTION_UPDATED':
        return this.handleSubscriptionUpdated(data);
      case 'SUBSCRIPTION_DELETED':
        return this.handleSubscriptionDeleted(data);
      case 'SUBSCRIPTION_RENEWED':
        return this.handleSubscriptionRenewed(data);
      case 'SUBSCRIPTION_PAYMENT_CREATED':
        return this.handleSubscriptionPaymentCreated(data);
      case 'SUBSCRIPTION_PAYMENT_UPDATED':
        return this.handleSubscriptionPaymentUpdated(data);
      case 'SUBSCRIPTION_PAYMENT_CONFIRMED':
        return this.handleSubscriptionPaymentConfirmed(data);
      case 'SUBSCRIPTION_PAYMENT_RECEIVED':
        return this.handleSubscriptionPaymentReceived(data);
      case 'SUBSCRIPTION_PAYMENT_OVERDUE':
        return this.handleSubscriptionPaymentOverdue(data);
      case 'SUBSCRIPTION_PAYMENT_REFUNDED':
        return this.handleSubscriptionPaymentRefunded(data);
      case 'SUBSCRIPTION_PAYMENT_DELETED':
        return this.handleSubscriptionPaymentDeleted(data);
      case 'SUBSCRIPTION_PAYMENT_RESTORED':
        return this.handleSubscriptionPaymentRestored(data);
      case 'SUBSCRIPTION_PAYMENT_DUNNING_RECEIVED':
        return this.handleSubscriptionPaymentDunningReceived(data);
      case 'SUBSCRIPTION_PAYMENT_DUNNING_REQUESTED':
        return this.handleSubscriptionPaymentDunningRequested(data);
      case 'SUBSCRIPTION_PAYMENT_BANK_SLIP_VIEWED':
        return this.handleSubscriptionPaymentBankSlipViewed(data);
      case 'SUBSCRIPTION_PAYMENT_CHECKOUT_VIEWED':
        return this.handleSubscriptionPaymentCheckoutViewed(data);
      case 'TRANSFER_CREATED':
        return this.handleTransferCreated(data);
      case 'TRANSFER_UPDATED':
        return this.handleTransferUpdated(data);
      case 'ANTICIPATION_CREATED':
        return this.handleAnticipationCreated(data);
      case 'ANTICIPATION_UPDATED':
        return this.handleAnticipationUpdated(data);
      default:
        return { event, data, processed: false, message: 'Event not handled' };
    }
  }

  // Webhook event handlers
  private handlePaymentCreated(data: any) {
    return { event: 'PAYMENT_CREATED', data, processed: true };
  }

  private handlePaymentUpdated(data: any) {
    return { event: 'PAYMENT_UPDATED', data, processed: true };
  }

  private handlePaymentConfirmed(data: any) {
    return { event: 'PAYMENT_CONFIRMED', data, processed: true };
  }

  private handlePaymentReceived(data: any) {
    return { event: 'PAYMENT_RECEIVED', data, processed: true };
  }

  private handlePaymentOverdue(data: any) {
    return { event: 'PAYMENT_OVERDUE', data, processed: true };
  }

  private handlePaymentRefunded(data: any) {
    return { event: 'PAYMENT_REFUNDED', data, processed: true };
  }

  private handlePaymentDeleted(data: any) {
    return { event: 'PAYMENT_DELETED', data, processed: true };
  }

  private handlePaymentRestored(data: any) {
    return { event: 'PAYMENT_RESTORED', data, processed: true };
  }

  private handlePaymentRefundScheduled(data: any) {
    return { event: 'PAYMENT_REFUND_SCHEDULED', data, processed: true };
  }

  private handlePaymentDunningReceived(data: any) {
    return { event: 'PAYMENT_DUNNING_RECEIVED', data, processed: true };
  }

  private handlePaymentDunningRequested(data: any) {
    return { event: 'PAYMENT_DUNNING_REQUESTED', data, processed: true };
  }

  private handlePaymentBankSlipViewed(data: any) {
    return { event: 'PAYMENT_BANK_SLIP_VIEWED', data, processed: true };
  }

  private handlePaymentCheckoutViewed(data: any) {
    return { event: 'PAYMENT_CHECKOUT_VIEWED', data, processed: true };
  }

  private handleSubscriptionCreated(data: any) {
    return { event: 'SUBSCRIPTION_CREATED', data, processed: true };
  }

  private handleSubscriptionUpdated(data: any) {
    return { event: 'SUBSCRIPTION_UPDATED', data, processed: true };
  }

  private handleSubscriptionDeleted(data: any) {
    return { event: 'SUBSCRIPTION_DELETED', data, processed: true };
  }

  private handleSubscriptionRenewed(data: any) {
    return { event: 'SUBSCRIPTION_RENEWED', data, processed: true };
  }

  private handleSubscriptionPaymentCreated(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_CREATED', data, processed: true };
  }

  private handleSubscriptionPaymentUpdated(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_UPDATED', data, processed: true };
  }

  private handleSubscriptionPaymentConfirmed(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_CONFIRMED', data, processed: true };
  }

  private handleSubscriptionPaymentReceived(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_RECEIVED', data, processed: true };
  }

  private handleSubscriptionPaymentOverdue(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_OVERDUE', data, processed: true };
  }

  private handleSubscriptionPaymentRefunded(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_REFUNDED', data, processed: true };
  }

  private handleSubscriptionPaymentDeleted(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_DELETED', data, processed: true };
  }

  private handleSubscriptionPaymentRestored(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_RESTORED', data, processed: true };
  }

  private handleSubscriptionPaymentDunningReceived(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_DUNNING_RECEIVED', data, processed: true };
  }

  private handleSubscriptionPaymentDunningRequested(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_DUNNING_REQUESTED', data, processed: true };
  }

  private handleSubscriptionPaymentBankSlipViewed(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_BANK_SLIP_VIEWED', data, processed: true };
  }

  private handleSubscriptionPaymentCheckoutViewed(data: any) {
    return { event: 'SUBSCRIPTION_PAYMENT_CHECKOUT_VIEWED', data, processed: true };
  }

  private handleTransferCreated(data: any) {
    return { event: 'TRANSFER_CREATED', data, processed: true };
  }

  private handleTransferUpdated(data: any) {
    return { event: 'TRANSFER_UPDATED', data, processed: true };
  }

  private handleAnticipationCreated(data: any) {
    return { event: 'ANTICIPATION_CREATED', data, processed: true };
  }

  private handleAnticipationUpdated(data: any) {
    return { event: 'ANTICIPATION_UPDATED', data, processed: true };
  }

  /**
   * Format date to YYYY-MM-DD format
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      throw new HttpException(
        {
          status,
          error: data.errors || data.error || 'Asaas API error',
        },
        status || HttpStatus.BAD_REQUEST,
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new HttpException(
        {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'No response from Asaas API',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error setting up request to Asaas API',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
