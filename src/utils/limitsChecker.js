import { onrampClient } from "./onrampClient";
import { moonpayClient } from "./moonpayClient";
import apiClient from "./apiClient";

/**
 * Checks if MoonPay supports a transaction based on their limits
 */
export const checkMoonPayLimits = async (params) => {
  const { fromCoin, toCurrency, amount, action } = params;
  
  try {
    const res = await apiClient.get("/moonpay/limits/", {
      params: {
        currencyCode: fromCoin.toLowerCase(),
        baseCurrencyCode: toCurrency.toLowerCase(),
        paymentMethod: "credit_debit_card"
      }
    });
    
    const limitsData = res.data?.limits || res.data?.data?.limits;
    
    if (!limitsData) {
      return { isValid: false, reason: 'NO_LIMITS_DATA' };
    }
    
    const numAmount = Number(amount);
    const minAmount = action === "BUY" 
      ? limitsData.minBuyAmount || limitsData.baseCurrency?.minBuyAmount
      : limitsData.minSellAmount || limitsData.baseCurrency?.minSellAmount;
    const maxAmount = action === "BUY" 
      ? limitsData.maxBuyAmount || limitsData.baseCurrency?.maxBuyAmount
      : limitsData.maxSellAmount || limitsData.baseCurrency?.maxSellAmount;
    
    if (minAmount && numAmount < minAmount) {
      return { 
        isValid: false, 
        reason: 'BELOW_MIN',
        minAmount,
        maxAmount
      };
    }
    
    if (maxAmount && numAmount > maxAmount) {
      return { 
        isValid: false, 
        reason: 'ABOVE_MAX',
        minAmount,
        maxAmount
      };
    }
    
    return { 
      isValid: true,
      minAmount,
      maxAmount
    };
    
  } catch (err) {
    console.error("Error checking MoonPay limits:", err);
    return { isValid: true }; // Don't block if we can't check limits
  }
};

/**
 * Fetches limits from all providers and returns aggregated min/max
 */
export const fetchProviderLimits = async (params) => {
  const { fromCoin, toCurrency, action } = params;
  
  const limits = {
    providers: [],
    globalMin: null,
    globalMax: null,
    hasProviders: false,
  };

  try {
    // Fetch limits from all providers in parallel
    const limitPromises = [];

    // 1. Meld limits - try multiple sample amounts to find actual limits
    const sampleAmounts = action === "BUY" 
      ? [10, 100, 1000, 10000, 100000] 
      : [0.0001, 0.001, 0.01, 0.1, 1];

    limitPromises.push(
      Promise.all(
        sampleAmounts.map(sampleAmount =>
          apiClient.post("/meld/crypto-quote/", {
            action: action.toUpperCase(),
            sourceAmount: sampleAmount,
            sourceCurrencyCode: action === "BUY" ? toCurrency : fromCoin,
            destinationCurrencyCode: action === "BUY" ? fromCoin : toCurrency,
            countryCode: toCurrency.slice(0, 2),
          })
          .then(res => {
            const data = res.data;
            const quotes = data?.data?.quotes || data?.quotes || [];
            return quotes.map(q => ({
              provider: q.serviceProvider || q.provider,
              minAmount: q.minimumAmount || q.minAmount,
              maxAmount: q.maximumAmount || q.maxAmount,
              source: 'meld'
            }));
          })
          .catch(() => [])
        )
      ).then(results => {
        // Flatten and deduplicate by provider
        const allMeldQuotes = results.flat();
        const providerMap = new Map();
        
        allMeldQuotes.forEach(quote => {
          const existing = providerMap.get(quote.provider);
          if (!existing || 
              (quote.minAmount && (!existing.minAmount || quote.minAmount < existing.minAmount)) ||
              (quote.maxAmount && (!existing.maxAmount || quote.maxAmount > existing.maxAmount))) {
            providerMap.set(quote.provider, quote);
          }
        });
        
        return Array.from(providerMap.values());
      })
    );

    // 2. OnRamp limits (only for NGN)
    if (toCurrency === "NGN") {
      limitPromises.push(
        onrampClient.getSupportedCryptocurrencies()
          .then(() => ({
            provider: 'ONRAMP',
            minAmount: action === "BUY" ? 1000 : 0.0001,
            maxAmount: action === "BUY" ? 10000000 : 100,
            source: 'onramp'
          }))
          .catch(() => null)
      );
    }

    // 3. MoonPay limits
    limitPromises.push(
      apiClient.get("/moonpay/limits/", {
        params: {
          currencyCode: action === "BUY" ? fromCoin.toLowerCase() : fromCoin.toLowerCase(),
          baseCurrencyCode: action === "BUY" ? toCurrency.toLowerCase() : toCurrency.toLowerCase(),
          paymentMethod: "credit_debit_card"
        }
      })
        .then(res => {
          const limitsData = res.data?.limits || res.data?.data?.limits;
          
          if (limitsData) {
            return {
              provider: 'MOONPAY',
              minAmount: action === "BUY" 
                ? limitsData.minBuyAmount || limitsData.baseCurrency?.minBuyAmount
                : limitsData.minSellAmount || limitsData.baseCurrency?.minSellAmount,
              maxAmount: action === "BUY" 
                ? limitsData.maxBuyAmount || limitsData.baseCurrency?.maxBuyAmount
                : limitsData.maxSellAmount || limitsData.baseCurrency?.maxSellAmount,
              source: 'moonpay',
              raw: limitsData
            };
          }
          return null;
        })
        .catch(err => {
          console.error("MoonPay limits error:", err);
          return null;
        })
    );

    const results = await Promise.all(limitPromises);
    const allLimits = results.flat().filter(Boolean);

    if (allLimits.length > 0) {
      limits.providers = allLimits;
      limits.hasProviders = true;

      // Calculate global min/max (most permissive across ALL providers)
      const validMins = allLimits
        .map(l => l.minAmount)
        .filter(v => v != null && v > 0);
      const validMaxs = allLimits
        .map(l => l.maxAmount)
        .filter(v => v != null && v > 0);

      // Global min is the LOWEST minimum (most permissive entry point)
      limits.globalMin = validMins.length > 0 ? Math.min(...validMins) : null;
      
      // Global max is the HIGHEST maximum (most permissive upper limit)
      limits.globalMax = validMaxs.length > 0 ? Math.max(...validMaxs) : null;

      console.log('📊 Provider Limits Summary:', {
        providers: allLimits.map(l => ({
          name: l.provider,
          min: l.minAmount,
          max: l.maxAmount
        })),
        globalMin: limits.globalMin,
        globalMax: limits.globalMax
      });
    }

  } catch (err) {
    console.error("Error fetching limits:", err);
  }

  return limits;
};

/**
 * Validates if an amount is within provider limits
 * Returns validation result with detailed error if outside limits
 */
export const validateAmountAgainstLimits = (amount, limits, action, fromCoin, toCurrency) => {
  const { globalMin, globalMax, hasProviders, providers } = limits;

  if (!hasProviders) {
    return {
      isValid: false,
      error: analyzeNoProvidersError(amount, limits, action, fromCoin, toCurrency)
    };
  }

  const numAmount = Number(amount);

  // Check against minimum
  if (globalMin && numAmount < globalMin) {
    return {
      isValid: false,
      error: analyzeNoProvidersError(amount, limits, action, fromCoin, toCurrency)
    };
  }

  // Check against maximum
  if (globalMax && numAmount > globalMax) {
    return {
      isValid: false,
      error: analyzeNoProvidersError(amount, limits, action, fromCoin, toCurrency)
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Analyzes why no providers are available and returns user-friendly error
 */
export const analyzeNoProvidersError = (amount, limits, action, fromCoin, toCurrency) => {
  const { globalMin, globalMax, hasProviders, providers } = limits;

  // No providers support this pair at all
  if (!hasProviders || !providers || providers.length === 0) {
    return {
      type: 'UNSUPPORTED_PAIR',
      message: `No providers currently support ${action === 'BUY' ? 'buying' : 'selling'} ${fromCoin} with ${toCurrency}. Please try a different pair.`,
      suggestion: 'Try using a different currency pair',
    };
  }

  const numAmount = Number(amount);

  // Amount is below minimum - use GLOBAL minimum
  if (globalMin && numAmount < globalMin) {
    return {
      type: 'BELOW_MINIMUM',
      message: `Amount is below the minimum limit across all providers. Minimum ${action === 'BUY' ? 'purchase' : 'sale'} amount is ${formatNumber(globalMin, 2)} ${action === 'BUY' ? toCurrency : fromCoin}.`,
      suggestion: `Please enter at least ${formatNumber(globalMin, 2)} ${action === 'BUY' ? toCurrency : fromCoin}`,
      minAmount: globalMin,
      providersInfo: getProvidersLimitsSummary(providers, 'min', action)
    };
  }

  // Amount is above maximum - use GLOBAL maximum
  if (globalMax && numAmount > globalMax) {
    return {
      type: 'ABOVE_MAXIMUM',
      message: `Amount exceeds the maximum limit across all providers. Maximum ${action === 'BUY' ? 'purchase' : 'sale'} amount is ${formatNumber(globalMax, 2)} ${action === 'BUY' ? toCurrency : fromCoin}.`,
      suggestion: `Please enter no more than ${formatNumber(globalMax, 2)} ${action === 'BUY' ? toCurrency : fromCoin}`,
      maxAmount: globalMax,
      providersInfo: getProvidersLimitsSummary(providers, 'max', action)
    };
  }

  // Generic error (shouldn't happen often)
  return {
    type: 'UNKNOWN',
    message: 'No providers available for this transaction. Please try adjusting the amount or currency pair.',
    suggestion: 'Try a different amount or currency',
  };
};

/**
 * Helper to get a summary of provider limits for debugging
 */
const getProvidersLimitsSummary = (providers, limitType, action) => {
  if (!providers || providers.length === 0) return '';
  
  return providers
    .map(p => {
      const limit = limitType === 'min' ? p.minAmount : p.maxAmount;
      return limit ? `${p.provider}: ${formatNumber(limit, 2)}` : null;
    })
    .filter(Boolean)
    .join(', ');
};

/**
 * Helper function to format numbers
 */
const formatNumber = (n, decimals = 2) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
  const num = Number(n);
  return num >= 1
    ? num.toLocaleString(undefined, { maximumFractionDigits: decimals })
    : num.toLocaleString(undefined, { maximumFractionDigits: decimals });
};