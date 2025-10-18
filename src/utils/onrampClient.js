import apiClient from "./apiClient";

export const onrampClient = {
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
  
      const res = await apiClient.post("/onramp/quote/", payload);
      const data = res.data;
      const quote = data?.quote || data?.data?.quote;
  
      if (!quote) {
        throw new Error(data?.message || "Failed to get quote");
      }
  
      // Normalize the quote for BuyFlow
      return {
        serviceProvider: "ONRAMP",
        provider: "ONRAMP",
        destinationAmount: quote.estimatedAmount,
        destinationAmountWithoutFees: quote.estimatedAmount,
        exchangeRate: quote.rate,
        totalFee: quote.totalFees,
        transactionFee: quote.fees?.clientFee ?? null,
        networkFee: quote.fees?.gasFee ?? null,
        logoUrl: "/providers/onramp.png",
        ...quote, // keep original data
      };
    } catch (err) {
      console.error('OnRamp buy quote error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get buy quote";
      const errorDetails = err.response?.data?.details || err.response?.data?.supportedCurrencies;
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
  
      const res = await apiClient.post("/onramp/quote/", payload);
      const data = res.data;
      const quote = data?.quote || data?.data?.quote;
  
      if (!quote) {
        throw new Error(data?.message || "Failed to get quote");
      }
  
      // Normalize the quote for BuyFlow
      return {
        serviceProvider: "ONRAMP",
        provider: "ONRAMP",
        destinationAmount: quote.estimatedAmount,
        destinationAmountWithoutFees: quote.estimatedAmount,
        exchangeRate: quote.rate,
        totalFee: quote.totalFees,
        transactionFee: quote.fees?.clientFee ?? null,
        networkFee: quote.fees?.gasFee ?? null,
        logoUrl: "/providers/onramp.png",
        ...quote,
      };
    } catch (err) {
      console.error('OnRamp sell quote error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get sell quote";
      const errorDetails = err.response?.data?.details || err.response?.data?.supportedCurrencies;
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
  
      console.log('OnRamp Sell URL Payload:', payload); // Debug log
  
      const res = await apiClient.post("/onramp/generate-url/", payload);
      
      // Handle different response structures
      return res.data?.widgetUrl || res.data?.paymentUrl || res.data?.data?.paymentLink;
    } catch (err) {
      console.error('OnRamp sell URL generation error:', err.response?.data || err.message);
      throw err;
    }
  },
  
  // Generate widget URL for BUY
  async generateBuyUrl(params) {
    const { 
      sourceCurrency, 
      destinationCurrency, 
      sourceAmount,
    } = params;
        
    try {
      const payload = {
        action: "BUY",
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        sourceAmount: sourceAmount,
      };
  
      console.log('OnRamp Buy URL Payload:', payload); // Debug log
  
      const res = await apiClient.post("/onramp/generate-url/", payload);
      
      // Handle different response structures
      return res.data?.widgetUrl || res.data?.paymentUrl || res.data?.data?.paymentLink;
    } catch (err) {
      console.error('OnRamp buy URL generation error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Fetch available payment methods
  async getPaymentMethods(params) {
    try {
      const res = await apiClient.get("/onramp/payment-methods/", { params });
      const data = res.data?.data || res.data;
      
      // Return structured data
      return {
        fiatCurrencies: data?.fiatSymbolMapping || {},
        cryptocurrencies: data?.coinSymbolMapping || {},
        chains: data?.chainMapping || {},
        raw: data // Keep raw data for flexibility
      };
    } catch (err) {
      console.error('OnRamp payment methods error:', err.response?.data || err.message);
      return {
        fiatCurrencies: {},
        cryptocurrencies: {},
        chains: {},
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

  // Helper: Get list of supported networks/chains
  async getSupportedNetworks() {
    try {
      const methods = await this.getPaymentMethods();
      return Object.keys(methods.chains);
    } catch (err) {
      console.error('Error fetching supported networks:', err);
      return [];
    }
  },
};