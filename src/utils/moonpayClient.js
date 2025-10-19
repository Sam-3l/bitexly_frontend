import apiClient from "./apiClient";

export const moonpayClient = {
  // Fetch quote for BUY
  async getBuyQuote(params) {
    const { sourceAmount, sourceCurrency, destinationCurrency, countryCode } = params;
  
    try {
      const payload = {
        action: "BUY",
        sourceAmount,
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        countryCode,
      };
  
      const res = await apiClient.post("/moonpay/quote/", payload);
      const data = res.data;
      const quote = data?.quote || data?.data?.quote;
  
      if (!quote) {
        throw new Error(data?.message || "Failed to get quote");
      }
  
      // Normalize the quote for BuyFlow
      return {
        serviceProvider: "MOONPAY",
        provider: "MOONPAY",
        destinationAmount: quote.estimatedAmount,
        destinationAmountWithoutFees: quote.estimatedAmount,
        exchangeRate: quote.rate,
        totalFee: quote.totalFees,
        transactionFee: quote.fees?.moonpayFee ?? null,
        networkFee: quote.fees?.networkFee ?? null,
        logoUrl: "/providers/moonpay.png",
        ...quote, // keep original data
      };
    } catch (err) {
      console.error('MoonPay buy quote error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get buy quote";
      const errorDetails = err.response?.data?.details;
      throw new Error(errorMessage + (errorDetails ? ` - ${JSON.stringify(errorDetails)}` : ''));
    }
  },
  
  async getSellQuote(params) {
    const { sourceAmount, sourceCurrency, destinationCurrency, countryCode } = params;
  
    try {
      const payload = {
        action: "SELL",
        sourceAmount,
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        countryCode,
      };
  
      const res = await apiClient.post("/moonpay/quote/", payload);
      const data = res.data;
      const quote = data?.quote || data?.data?.quote;
  
      if (!quote) {
        throw new Error(data?.message || "Failed to get quote");
      }
  
      // Normalize the quote for SellFlow
      return {
        serviceProvider: "MOONPAY",
        provider: "MOONPAY",
        destinationAmount: quote.estimatedAmount,
        destinationAmountWithoutFees: quote.estimatedAmount,
        exchangeRate: quote.rate,
        totalFee: quote.totalFees,
        transactionFee: quote.fees?.moonpayFee ?? null,
        networkFee: quote.fees?.networkFee ?? null,
        logoUrl: "/providers/moonpay.png",
        ...quote,
      };
    } catch (err) {
      console.error('MoonPay sell quote error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get sell quote";
      const errorDetails = err.response?.data?.details;
      throw new Error(errorMessage + (errorDetails ? ` - ${JSON.stringify(errorDetails)}` : ''));
    }
  },  

  // Generate widget URL for SELL
  async generateSellUrl(params) {
    const { 
      sourceCurrency, 
      destinationCurrency, 
      sourceAmount,
    } = params;
    
    try {
      const payload = {
        action: "SELL",
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        sourceAmount: sourceAmount,
      };
  
      console.log('MoonPay Sell URL Payload:', payload); // Debug log
  
      const res = await apiClient.post("/moonpay/generate-url/", payload);
      
      // Handle different response structures
      return res.data?.widgetUrl || res.data?.paymentUrl || res.data?.data?.link;
    } catch (err) {
      console.error('MoonPay sell URL generation error:', err.response?.data || err.message);
      throw err;
    }
  },
  
  // Generate widget URL for BUY
  async generateBuyUrl(params) {
    const { 
      sourceCurrency, 
      destinationCurrency, 
      sourceAmount,
      walletAddress, // Required for buy transactions
    } = params;
        
    try {
      const payload = {
        action: "BUY",
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        sourceAmount: sourceAmount,
        walletAddress: walletAddress,
      };
  
      console.log('MoonPay Buy URL Payload:', payload); // Debug log
  
      const res = await apiClient.post("/moonpay/generate-url/", payload);
      
      // Handle different response structures
      return res.data?.widgetUrl || res.data?.paymentUrl || res.data?.data?.link;
    } catch (err) {
      console.error('MoonPay buy URL generation error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Fetch available payment methods
  async getPaymentMethods(params) {
    try {
      const res = await apiClient.get("/moonpay/payment-methods/", { params });
      const data = res.data?.data || res.data;
      
      // Return structured data
      return {
        fiatCurrencies: data?.fiatSymbolMapping || {},
        cryptocurrencies: data?.coinSymbolMapping || {},
        paymentMethods: data?.paymentMethods || [],
        raw: data // Keep raw data for flexibility
      };
    } catch (err) {
      console.error('MoonPay payment methods error:', err.response?.data || err.message);
      return {
        fiatCurrencies: {},
        cryptocurrencies: {},
        paymentMethods: [],
        raw: {}
      };
    }
  },

  // Helper: Get list of supported fiat currencies
  async getSupportedFiatCurrencies() {
    try {
      const methods = await this.getPaymentMethods();
      return Object.keys(methods.fiatCurrencies).map(code => code.toUpperCase());
    } catch (err) {
      console.error('Error fetching supported currencies:', err);
      return [];
    }
  },

  // Helper: Get list of supported cryptocurrencies
  async getSupportedCryptocurrencies() {
    try {
      const methods = await this.getPaymentMethods();
      return Object.keys(methods.cryptocurrencies).map(code => code.toUpperCase());
    } catch (err) {
      console.error('Error fetching supported cryptocurrencies:', err);
      return [];
    }
  },

  // Helper: Get transaction status
  async getTransactionStatus(transactionId) {
    try {
      const res = await apiClient.get(`/moonpay/transaction/${transactionId}/`);
      return res.data?.transaction || res.data;
    } catch (err) {
      console.error('Error fetching transaction status:', err);
      throw err;
    }
  },

  // Helper: Get user's IP info
  async getIpInfo() {
    try {
      const res = await apiClient.get('/moonpay/ip-info/');
      return res.data?.ipInfo || res.data;
    } catch (err) {
      console.error('Error fetching IP info:', err);
      return {};
    }
  },
};