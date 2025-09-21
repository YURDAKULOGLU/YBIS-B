export interface UserFriendlyError {
  code: string;
  message: string;
  hint?: string;
}

export function errorToUserMessage(error: unknown): UserFriendlyError {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Geçersiz veri formatı',
        hint: 'Lütfen girdiğiniz bilgileri kontrol edin',
      };
    }
    
    if (error.name === 'NetworkError') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Bağlantı sorunu',
        hint: 'İnternet bağlantınızı kontrol edin',
      };
    }
    
    if (error.name === 'AuthenticationError') {
      return {
        code: 'AUTH_ERROR',
        message: 'Kimlik doğrulama hatası',
        hint: 'Lütfen tekrar giriş yapın',
      };
    }
    
    if (error.name === 'RateLimitError') {
      return {
        code: 'RATE_LIMIT',
        message: 'Çok fazla istek',
        hint: 'Lütfen bir süre bekleyip tekrar deneyin',
      };
    }
    
    // Generic error
    return {
      code: 'INTERNAL_ERROR',
      message: 'Beklenmeyen bir hata oluştu',
      hint: 'Lütfen daha sonra tekrar deneyin',
    };
  }
  
  // Unknown error type
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Bilinmeyen hata',
    hint: 'Lütfen destek ekibiyle iletişime geçin',
  };
}

