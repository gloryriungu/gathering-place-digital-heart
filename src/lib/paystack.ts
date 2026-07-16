/**
 * Paystack Integration Utilities
 * 
 * Public key for client-side operations
 * Secret key operations are handled by edge functions
 */

export const PAYSTACK_PUBLIC_KEY = 'pk_test_f6377c31ab144a2621981166eed6a50d6bb91976';

export type PaymentMethod = 'mobile_money' | 'card';

export interface InitializePaymentParams {
  payment_method: PaymentMethod;
  amount: number;
  email: string;
  phone?: string;
  contribution_type: string;
  user_id?: string;
  save_details?: boolean;
  name?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
    contribution_id: string;
  };
  error?: string;
}

export interface VerificationResponse {
  success: boolean;
  data?: {
    status: string;
    amount: number;
    currency: string;
    reference: string;
    paid_at: string;
    channel: string;
    contribution: {
      id: string;
      type: string;
      amount: number;
    };
  };
  error?: string;
}

/**
 * Format phone number to 254 format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^254[71]\d{8}$/.test(formatted);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get contribution type label
 */
export function getContributionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    tithe: 'Tithe',
    offering: 'Offering',
    building_fund: 'Building Fund',
    missions: 'Missions',
    community_outreach: 'Community Outreach',
    special_offering: 'Special Offering',
  };
  return labels[type] || type;
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    mobile_money: 'M-Pesa',
    mpesa: 'M-Pesa',
    card: 'Card',
  };
  return labels[method] || method;
}