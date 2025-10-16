export const validateBankDetails = (bankDetails, currency) => {
    const { accountNumber, accountName, bankName, routingNumber } = bankDetails;
  
    // Basic checks
    if (!accountNumber?.trim() || !accountName?.trim() || !bankName?.trim()) {
      return { isValid: false, error: "All fields are required" };
    }
  
    // Account name validation (at least 3 characters, letters and spaces only)
    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!nameRegex.test(accountName.trim())) {
      return { isValid: false, error: "Invalid account name format" };
    }
  
    // Bank name validation
    if (bankName.trim().length < 2) {
      return { isValid: false, error: "Bank name is too short" };
    }
  
    // Currency-specific validation
    switch (currency) {
      case 'NGN':
        return validateNigerianBank(accountNumber, routingNumber);
      
      case 'USD':
        return validateUSBank(accountNumber, routingNumber);
      
      case 'GBP':
        return validateUKBank(accountNumber, routingNumber);
      
      case 'EUR':
        return validateEuropeanBank(accountNumber, routingNumber);
      
      default:
        return validateGenericBank(accountNumber);
    }
  };
  
  const validateNigerianBank = (accountNumber, routingNumber) => {
    // Nigerian bank accounts: exactly 10 digits (NUBAN)
    const nubanRegex = /^\d{10}$/;
    
    if (!nubanRegex.test(accountNumber)) {
      return { 
        isValid: false, 
        error: "Nigerian account numbers must be exactly 10 digits" 
      };
    }
  
    return { isValid: true };
  };
  
  const validateUSBank = (accountNumber, routingNumber) => {
    // US account numbers: 4-17 digits
    const accountRegex = /^\d{4,17}$/;
    
    if (!accountRegex.test(accountNumber)) {
      return { 
        isValid: false, 
        error: "US account numbers must be 4-17 digits" 
      };
    }
  
    // US routing numbers: exactly 9 digits (ABA routing number)
    if (routingNumber) {
      const routingRegex = /^\d{9}$/;
      if (!routingRegex.test(routingNumber)) {
        return { 
          isValid: false, 
          error: "US routing numbers must be exactly 9 digits" 
        };
      }
    }
  
    return { isValid: true };
  };
  
  const validateUKBank = (accountNumber, sortCode) => {
    // UK account numbers: 8 digits
    const accountRegex = /^\d{8}$/;
    
    if (!accountRegex.test(accountNumber)) {
      return { 
        isValid: false, 
        error: "UK account numbers must be exactly 8 digits" 
      };
    }
  
    // UK sort code (passed as routingNumber): 6 digits (may have hyphens)
    if (sortCode) {
      const sortCodeClean = sortCode.replace(/-/g, '');
      const sortCodeRegex = /^\d{6}$/;
      if (!sortCodeRegex.test(sortCodeClean)) {
        return { 
          isValid: false, 
          error: "UK sort codes must be exactly 6 digits" 
        };
      }
    }
  
    return { isValid: true };
  };
  
  const validateEuropeanBank = (accountNumber, bic) => {
    // IBAN format for European accounts (starts with 2-letter country code)
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
    
    if (!ibanRegex.test(accountNumber.replace(/\s/g, ''))) {
      return { 
        isValid: false, 
        error: "European accounts should be in IBAN format (e.g., DE89370400440532013000)" 
      };
    }
  
    // BIC/SWIFT code validation (optional for EUR)
    if (bic) {
      const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
      if (!bicRegex.test(bic)) {
        return { 
          isValid: false, 
          error: "Invalid BIC/SWIFT code format" 
        };
      }
    }
  
    return { isValid: true };
  };
  
  const validateGenericBank = (accountNumber) => {
    // Generic validation: 4-34 alphanumeric characters
    const genericRegex = /^[A-Z0-9]{4,34}$/i;
    
    if (!genericRegex.test(accountNumber.replace(/\s/g, ''))) {
      return { 
        isValid: false, 
        error: "Account number must be 4-34 characters" 
      };
    }
  
    return { isValid: true };
  };