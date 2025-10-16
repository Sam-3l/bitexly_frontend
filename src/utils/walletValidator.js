// Cryptocurrency wallet address validator
export const validateWalletAddress = (address, cryptocurrency) => {
    if (!address || !address.trim()) return false;
  
    const crypto = cryptocurrency.toUpperCase();
    
    switch (crypto) {
      case 'BTC':
      case 'BITCOIN':
        return validateBitcoinAddress(address);
      
      case 'ETH':
      case 'ETHEREUM':
        return validateEthereumAddress(address);
      
      case 'USDT':
      case 'USDC':
        // These tokens can be on multiple chains, validate based on format
        return validateEthereumAddress(address) || validateTronAddress(address);
      
      case 'TRX':
      case 'TRON':
        return validateTronAddress(address);
      
      case 'LTC':
      case 'LITECOIN':
        return validateLitecoinAddress(address);
      
      case 'XRP':
      case 'RIPPLE':
        return validateRippleAddress(address);
      
      default:
        // Fallback: basic length check
        return address.length >= 26 && address.length <= 90;
    }
  };
  
  const validateBitcoinAddress = (address) => {
    // Legacy addresses (P2PKH): start with 1
    const legacyRegex = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    // SegWit addresses (P2SH): start with 3
    const segwitRegex = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    // Native SegWit (Bech32): start with bc1
    const bech32Regex = /^(bc1)[a-z0-9]{39,87}$/;
    
    return legacyRegex.test(address) || segwitRegex.test(address) || bech32Regex.test(address);
  };
  
  const validateEthereumAddress = (address) => {
    // Ethereum addresses: 0x followed by 40 hexadecimal characters
    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethRegex.test(address);
  };
  
  const validateTronAddress = (address) => {
    // Tron addresses: start with T and are 34 characters
    const tronRegex = /^T[a-km-zA-HJ-NP-Z1-9]{33}$/;
    return tronRegex.test(address);
  };
  
  const validateLitecoinAddress = (address) => {
    // Legacy: starts with L
    const legacyRegex = /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/;
    // SegWit: starts with ltc1
    const segwitRegex = /^(ltc1)[a-z0-9]{39,87}$/;
    
    return legacyRegex.test(address) || segwitRegex.test(address);
  };
  
  const validateRippleAddress = (address) => {
    // Ripple addresses: start with r and are 25-34 characters
    const rippleRegex = /^r[a-km-zA-HJ-NP-Z1-9]{24,34}$/;
    return rippleRegex.test(address);
  };