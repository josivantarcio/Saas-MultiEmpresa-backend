import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CheckoutService } from '../services/checkout.service';

// DTO classes would normally be in separate files, simplified here for brevity
class LocationDto {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

class ApplyShippingMethodDto {
  shippingMethodId: string;
}

class ApplyCouponDto {
  couponCode: string;
}

class CreditCardDto {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  holderDocument: string;
}

class PaymentDataDto {
  customerId?: string;
  creditCard?: CreditCardDto;
  addressNumber?: string;
  installments?: number;
}

class ProcessCheckoutDto {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  paymentMethodId: string;
  paymentData?: PaymentDataDto;
  notes?: string;
  isGuestCheckout?: boolean;
}

class AsaasWebhookDto {
  event: string;
  payment: any;
}

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get(':cartId/shipping-options')
  @UseGuards(AuthGuard('jwt'))
  async getShippingOptions(
    @Request() req,
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body(ValidationPipe) locationDto: LocationDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.checkoutService.getShippingOptions(cartId, tenantId, locationDto);
  }

  @Get('payment-methods')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentMethods(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.checkoutService.getPaymentMethods(tenantId);
  }

  @Post(':cartId/apply-shipping')
  @UseGuards(AuthGuard('jwt'))
  async applyShippingMethod(
    @Request() req,
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body(ValidationPipe) applyShippingMethodDto: ApplyShippingMethodDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.checkoutService.applyShippingMethod(
      cartId,
      tenantId,
      applyShippingMethodDto.shippingMethodId
    );
  }

  @Post(':cartId/apply-coupon')
  @UseGuards(AuthGuard('jwt'))
  async applyCoupon(
    @Request() req,
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body(ValidationPipe) applyCouponDto: ApplyCouponDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.checkoutService.applyCoupon(
      cartId,
      tenantId,
      applyCouponDto.couponCode
    );
  }

  @Post(':cartId/process')
  @UseGuards(AuthGuard('jwt'))
  async processCheckout(
    @Request() req,
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body(ValidationPipe) processCheckoutDto: ProcessCheckoutDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.checkoutService.processCheckout(
      cartId,
      tenantId,
      processCheckoutDto
    );
  }

  @Post('webhook/asaas')
  @HttpCode(HttpStatus.OK)
  async handleAsaasWebhook(@Body() webhookData: AsaasWebhookDto) {
    return this.checkoutService.handleAsaasWebhook(webhookData);
  }
}
