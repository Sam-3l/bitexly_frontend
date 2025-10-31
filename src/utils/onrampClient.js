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
      
      // Check for success flag
      if (data.success === false) {
        // Extract error details
        const errorMsg = data.message || "Failed to get quote";
        const errorDetails = data.details || data.apiResponse?.error || "";
        
        const minAmount = data.minAmount || null;
        const maxAmount = data.maxAmount || null;
        
        const error = new Error(errorMsg);
        error.minAmount = minAmount;
        error.maxAmount = maxAmount;
        error.details = errorDetails;
        throw error;
      }
      
      const quote = data?.quote || data?.data?.quote;
  
      if (!quote) {
        throw new Error(data?.message || "Failed to get quote");
      }
  
      // Normalize the quote for BuyFlow
      return {
        serviceProvider: "ONRAMP",
        provider: "ONRAMP",
        destinationAmount: quote.estimatedAmount || quote.cryptoAmount || null,
        destinationAmountWithoutFees: quote.estimatedAmount || quote.cryptoAmount || null,
        exchangeRate: quote.rate || quote.exchangeRate || null,
        totalFee: quote.totalFees || quote.fees?.total || 0,
        transactionFee: quote.fees?.clientFee ?? quote.fees?.transactionFee ?? 0,
        networkFee: quote.fees?.gasFee ?? quote.fees?.networkFee ?? 0,
        minimumAmount: quote.minAmount || quote.minimumAmount || null,
        logoUrl: "/providers/onramp.png",
        ...quote, // keep original data
      };
    } catch (err) {
      console.error('OnRamp buy quote error:', err.response?.data || err.message);
      
      // If it's our custom error with min/max, preserve that info
      if (err.minAmount !== undefined || err.maxAmount !== undefined) {
        throw err;
      }
      
      // Otherwise, parse from response
      const responseData = err.response?.data;
      const errorMessage = responseData?.message || err.message || "Failed to get buy quote";
      const errorDetails = responseData?.details || responseData?.apiResponse?.error || "";
      
      // FIXED: Use min/max from backend response first
      let minAmount = responseData?.minAmount || null;
      let maxAmount = responseData?.maxAmount || null;
      
      // Fallback to parsing if not provided by backend
      if (!minAmount && !maxAmount && errorDetails) {
        const minMatch = errorDetails.match(/minimum.*?(\d+\.?\d*)/i);
        const maxMatch = errorDetails.match(/maximum.*?(\d+\.?\d*)/i);
        
        if (minMatch) minAmount = parseFloat(minMatch[1]);
        if (maxMatch) maxAmount = parseFloat(maxMatch[1]);
      }
      
      const error = new Error(errorMessage);
      error.minAmount = minAmount;
      error.maxAmount = maxAmount;
      error.details = errorDetails;
      throw error;
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
      
      // Check for success flag
      if (data.success === false) {
        // Extract error details
        const errorMsg = data.message || "Failed to get quote";
        const errorDetails = data.details || data.apiResponse?.error || "";
        
        // FIXED: Use min/max from backend response
        const minAmount = data.minAmount || null;
        const maxAmount = data.maxAmount || null;
        
        const error = new Error(errorMsg);
        error.minAmount = minAmount;
        error.maxAmount = maxAmount;
        error.details = errorDetails;
        throw error;
      }
      
      const quote = data?.quote || data?.data?.quote;
  
      if (!quote) {
        throw new Error(data?.message || "Failed to get quote");
      }
  
      // Normalize the quote for SellFlow
      return {
        serviceProvider: "ONRAMP",
        provider: "ONRAMP",
        destinationAmount: quote.estimatedAmount || quote.fiatAmount || null,
        destinationAmountWithoutFees: quote.estimatedAmount || quote.fiatAmount || null,
        exchangeRate: quote.rate || quote.exchangeRate || null,
        totalFee: quote.totalFees || quote.fees?.total || 0,
        transactionFee: quote.fees?.clientFee ?? quote.fees?.transactionFee ?? 0,
        networkFee: quote.fees?.gasFee ?? quote.fees?.networkFee ?? 0,
        minimumAmount: quote.minAmount || quote.minimumAmount || null,
        logoUrl: "/providers/onramp.png",
        ...quote,
      };
    } catch (err) {
      console.error('OnRamp sell quote error:', err.response?.data || err.message);
      
      // If it's our custom error with min/max, preserve that info
      if (err.minAmount !== undefined || err.maxAmount !== undefined) {
        throw err;
      }
      
      // Otherwise, parse from response
      const responseData = err.response?.data;
      const errorMessage = responseData?.message || err.message || "Failed to get sell quote";
      const errorDetails = responseData?.details || responseData?.apiResponse?.error || "";
      
      // FIXED: Use min/max from backend response first
      let minAmount = responseData?.minAmount || null;
      let maxAmount = responseData?.maxAmount || null;
      
      // Fallback to parsing if not provided by backend
      if (!minAmount && !maxAmount && errorDetails) {
        const minMatch = errorDetails.match(/minimum.*?(\d+\.?\d*)/i);
        const maxMatch = errorDetails.match(/maximum.*?(\d+\.?\d*)/i);
        
        if (minMatch) minAmount = parseFloat(minMatch[1]);
        if (maxMatch) maxAmount = parseFloat(maxMatch[1]);
      }
      
      const error = new Error(errorMessage);
      error.minAmount = minAmount;
      error.maxAmount = maxAmount;
      error.details = errorDetails;
      throw error;
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
  
      console.log('OnRamp Sell URL Payload:', payload);
  
      const res = await apiClient.post("/onramp/generate-url/", payload);
      
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
  
      console.log('OnRamp Buy URL Payload:', payload);
  
      const res = await apiClient.post("/onramp/generate-url/", payload);
      
      return res.data?.widgetUrl || res.data?.paymentUrl || res.data?.data?.paymentLink;
    } catch (err) {
      console.error('OnRamp buy URL generation error:', err.response?.data || err.message);
      throw err;
    }
  },

  async getPaymentMethods(params) {
    const { country, fiatCurrency, cryptoCurrency, type } = params;
    
    try {
      // Use the currency-specific endpoint
      const res = await apiClient.get("/onramp/payment-methods-by-currency/", {
        params: { fiatCurrency }
      });
      
      const data = res.data;
      
      if (!data.success || !data.data) {
        console.warn('OnRamp: Invalid payment methods response');
        return [];
      }

      const methodsForCurrency = data.data.paymentMethods;
      
      if (!methodsForCurrency || typeof methodsForCurrency !== 'object') {
        console.warn(`OnRamp: No payment methods available for ${fiatCurrency}`);
        return [];
      }

      // Check if empty object
      if (Object.keys(methodsForCurrency).length === 0) {
        console.warn(`OnRamp: Empty payment methods for ${fiatCurrency}`);
        return [];
      }

      // Convert object to array format expected by UI
      const methods = Object.entries(methodsForCurrency).map(([methodName, methodType]) => {
        // Normalize method name to match Meld convention (remove country prefix)
        const normalizedType = methodName.replace(/^[A-Z]{2}_/, ''); // Remove NG_, US_, etc.
        
        // Format the display name nicely
        const displayName = normalizedType
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        return {
          id: methodName,
          name: displayName,
          type: normalizedType, // Use normalized type (e.g., BANK_TRANSFER instead of NG_BANK_TRANSFER)
          paymentMethod: normalizedType,
          provider: 'ONRAMP',
          transferType: methodType, // 1 = instant transfer, 2 = bank transfer
          description: methodType === 1 ? 'Instant Transfer' : 'Bank Transfer',
          logos: {
            light: null,
            dark: null
          }
        };
      });

      console.log(`✅ OnRamp: Found ${methods.length} payment methods for ${fiatCurrency}`, methods);
      return methods;

    } catch (err) {
      console.error('❌ OnRamp payment methods error:', err.response?.data || err.message);
      return [];
    }
  },

  // Fetch all OnRamp configuration (for internal use)
  async getAllConfig() {
    try {
      const res = await apiClient.get("/onramp/payment-methods/");
      const data = res.data?.data || res.data;
      
      return {
        fiatCurrencies: data?.fiatSymbolMapping || {},
        cryptocurrencies: data?.coinSymbolMapping || {},
        chains: data?.chainSymbolMapping || {},
        raw: data
      };
    } catch (err) {
      console.error('OnRamp config error:', err.response?.data || err.message);
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
      const config = await this.getAllConfig();
      return Object.keys(config.fiatCurrencies).map(code => code.toUpperCase());
    } catch (err) {
      console.error('Error fetching supported currencies:', err);
      return [];
    }
  },

  // Helper: Get list of supported cryptocurrencies
  async getSupportedCryptocurrencies() {
    try {
      const config = await this.getAllConfig();
      return Object.keys(config.cryptocurrencies).map(code => code.toUpperCase());
    } catch (err) {
      console.error('Error fetching supported cryptocurrencies:', err);
      return [];
    }
  },

  // Helper: Get list of supported networks/chains
  async getSupportedNetworks() {
    try {
      const config = await this.getAllConfig();
      return Object.keys(config.chains);
    } catch (err) {
      console.error('Error fetching supported networks:', err);
      return [];
    }
  },
};