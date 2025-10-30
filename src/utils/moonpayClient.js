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
  
      console.log('MoonPay Sell URL Payload:', payload);
  
      const res = await apiClient.post("/moonpay/generate-url/", payload);
      
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
  
      console.log('MoonPay Buy URL Payload:', payload);
  
      const res = await apiClient.post("/moonpay/generate-url/", payload);
      
      return res.data?.widgetUrl || res.data?.paymentUrl || res.data?.data?.link;
    } catch (err) {
      console.error('MoonPay buy URL generation error:', err.response?.data || err.message);
      throw err;
    }
  },

  // ✅ FIXED: Fetch available payment methods
  async getPaymentMethods(params) {
    const { country, fiatCurrency } = params;
    
    try {
      const res = await apiClient.get("/moonpay/payment-methods/", { 
        params: { 
          fiatCurrency: fiatCurrency,
          country: country 
        }
      });
      
      const data = res.data;
      
      // Handle different response structures - be very flexible
      let methods = [];
      
      // Try multiple possible locations
      if (data.success && data.data) {
        methods = data.data.paymentMethods || 
                 data.data.payment_methods || 
                 data.data.methods ||
                 (Array.isArray(data.data) ? data.data : []);
      } else if (data.paymentMethods) {
        methods = data.paymentMethods;
      } else if (data.payment_methods) {
        methods = data.payment_methods;
      } else if (data.methods) {
        methods = data.methods;
      } else if (Array.isArray(data)) {
        methods = data;
      }

      // Ensure it's an array
      if (!Array.isArray(methods)) {
        console.warn('MoonPay: Payment methods is not an array', typeof methods, methods);
        return [];
      }

      if (methods.length === 0) {
        console.warn(`MoonPay: No payment methods available for ${fiatCurrency}`);
        return [];
      }

      // Transform to standard format
      const formattedMethods = methods.map(method => {
        // Handle different method structures
        const methodId = method.id || method.type || method.paymentMethod || method.name;
        const methodName = method.name || method.displayName || method.type || method.paymentMethod || methodId;
        const methodType = method.type || method.paymentMethod || methodId;

        // Format display name
        const displayName = typeof methodName === 'string' 
          ? methodName
              .replace(/-/g, ' ')
              .replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
          : String(methodName);

        return {
          id: methodId,
          name: displayName,
          type: methodType,
          paymentMethod: methodType,
          provider: 'MOONPAY',
          fee: method.fee || method.feePercentage || method.fees,
          minAmount: method.minAmount || method.minimumAmount || method.min,
          maxAmount: method.maxAmount || method.maximumAmount || method.max,
          logos: {
            light: method.logo || method.logoUrl || method.icon || null,
            dark: method.logo || method.logoUrl || method.icon || null
          }
        };
      });

      console.log(`✅ MoonPay: Found ${formattedMethods.length} payment methods for ${fiatCurrency}`, formattedMethods);
      return formattedMethods;

    } catch (err) {
      console.error('❌ MoonPay payment methods error:', err.response?.data || err.message);
      return [];
    }
  },

  // Fetch all MoonPay configuration (for internal use)
  async getAllConfig() {
    try {
      const res = await apiClient.get("/moonpay/payment-methods/");
      const data = res.data?.data || res.data;
      
      return {
        fiatCurrencies: data?.fiatSymbolMapping || data?.fiatCurrencies || {},
        cryptocurrencies: data?.coinSymbolMapping || data?.cryptoCurrencies || {},
        paymentMethods: data?.paymentMethods || [],
        raw: data
      };
    } catch (err) {
      console.error('MoonPay config error:', err.response?.data || err.message);
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
      const config = await this.getAllConfig();
      const currencies = config.fiatCurrencies;
      
      if (Array.isArray(currencies)) {
        return currencies.map(code => code.toUpperCase());
      } else if (typeof currencies === 'object') {
        return Object.keys(currencies).map(code => code.toUpperCase());
      }
      
      return [];
    } catch (err) {
      console.error('Error fetching supported currencies:', err);
      return [];
    }
  },

  // Helper: Get list of supported cryptocurrencies
  async getSupportedCryptocurrencies() {
    try {
      const config = await this.getAllConfig();
      const cryptocurrencies = config.cryptocurrencies;
      
      if (Array.isArray(cryptocurrencies)) {
        return cryptocurrencies.map(code => code.toUpperCase());
      } else if (typeof cryptocurrencies === 'object') {
        return Object.keys(cryptocurrencies).map(code => code.toUpperCase());
      }
      
      return [];
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