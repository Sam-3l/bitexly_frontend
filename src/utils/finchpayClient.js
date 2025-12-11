import apiClient from "./apiClient";

export const finchpayClient = {
  /**
   * Get BUY quote from FinchPay
   */
  async getBuyQuote({ sourceAmount, sourceCurrency, destinationCurrency, paymentMethod = "card" }) {
    try {
      const payload = {
        action: "BUY",
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        sourceAmount: Number(sourceAmount),
        paymentMethod: paymentMethod
      };

      const response = await apiClient.post("/finchpay/quote/", payload);
      const data = response.data;

      if (!data.success || !data.quote) {
        throw {
          message: data.message || "Failed to get FinchPay quote",
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          details: data.details
        };
      }

      const quote = data.quote;

      // Return in standardized format
      return {
        provider: "FINCHPAY",
        serviceProvider: "FINCHPAY",
        sourceAmount: quote.sourceAmount,
        sourceCurrency: quote.sourceCurrency,
        destinationCurrency: quote.destinationCurrency,
        destinationAmount: quote.cryptoAmount || quote.estimatedAmount,
        destinationAmountWithoutFees: quote.cryptoAmount || quote.estimatedAmount,
        exchangeRate: quote.exchangeRate || quote.rate,
        rate: quote.exchangeRate || quote.rate,
        totalFee: quote.totalFees || quote.fees?.transactionFee || 0,
        transactionFee: quote.fees?.transactionFee || quote.fees?.serviceFee || 0,
        networkFee: quote.fees?.networkFee || 0,
        minimumAmount: 50, // FinchPay typical minimum
        logoUrl: "/providers/finchpay.png",
        network: quote.network,
        paymentMethod: quote.paymentMethod
      };
    } catch (error) {
      console.error("FinchPay quote error:", error);
      throw {
        message: error.response?.data?.message || error.message || "FinchPay quote failed",
        minAmount: error.response?.data?.minAmount || error.minAmount,
        maxAmount: error.response?.data?.maxAmount || error.maxAmount,
        details: error.response?.data?.details || error.details
      };
    }
  },

  /**
   * Get payment methods for FinchPay
   */
  async getPaymentMethods() {
    try {
      const response = await apiClient.get("/finchpay/payment-methods/");
      const data = response.data;

      if (!data.success) return [];

      // Convert to array format expected by PaymentMethodSelect
      const methods = data.data?.paymentMethods || {};
      
      return Object.entries(methods).map(([key, label]) => ({
        type: key,
        id: key,
        paymentMethod: key,
        name: label,
        icon: key // You can map icons if needed
      }));
    } catch (error) {
      console.error("FinchPay payment methods error:", error);
      return [];
    }
  }
};