import apiClient from "./apiClient";

export const moonpayClient = {
  // Fetch quote for BUY
  async getBuyQuote(params) {
    const { sourceAmount, sourceCurrency, destinationCurrency } = params;
    
    try {
      const payload = {
        action: "BUY",
        sourceAmount: sourceAmount,
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
      };

      const res = await apiClient.post("/moonpay/quote/", payload);
      const data = res.data;
      const quote = data?.data?.quote || data?.quote;
      
      return quote;
    } catch (err) {
      console.error('MoonPay quote error:', err);
      throw err;
    }
  },

  // Fetch quote for SELL
  async getSellQuote(params) {
    const { sourceAmount, sourceCurrency, destinationCurrency } = params;
    
    try {
      const payload = {
        action: "SELL",
        sourceAmount: sourceAmount,
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
      };

      const res = await apiClient.post("/moonpay/quote/", payload);
      const data = res.data;
      const quote = data?.data?.quote || data?.quote;
      
      return quote;
    } catch (err) {
      console.error('MoonPay sell quote error:', err);
      throw err;
    }
  },

  // Generate widget URL for BUY
  async generateBuyUrl(params) {
    const { walletAddress, sourceCurrency, destinationCurrency, sourceAmount } = params;
    
    try {
      const payload = {
        action: "BUY",
        walletAddress: walletAddress,
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        sourceAmount: sourceAmount,
      };

      const res = await apiClient.post("/moonpay/generate-url/", payload);
      return res.data.widgetUrl;
    } catch (err) {
      console.error('MoonPay URL generation error:', err);
      throw err;
    }
  },

  // Generate widget URL for SELL
  async generateSellUrl(params) {
    const { sourceCurrency, destinationCurrency, sourceAmount, walletAddress } = params;
    
    try {
      const payload = {
        action: "SELL",
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        sourceAmount: sourceAmount,
        walletAddress: walletAddress || '',
      };

      const res = await apiClient.post("/moonpay/generate-url/", payload);
      return res.data.widgetUrl;
    } catch (err) {
      console.error('MoonPay URL generation error:', err);
      throw err;
    }
  },

  // Fetch available payment methods
  async getPaymentMethods(params) {
    try {
      const res = await apiClient.get("/moonpay/payment-methods/", { params });
      return res.data?.data || res.data || [];
    } catch (err) {
      console.error('MoonPay payment methods error:', err);
      return [];
    }
  },
};