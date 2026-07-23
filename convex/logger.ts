/**
 * Centralized logging utility for the backend.
 * Provides distinct formats for different severity levels to ease parsing in external monitoring tools.
 */

export const logger = {
  info: (event: string, context?: Record<string, any>) => {
    console.info(JSON.stringify({
      level: "INFO",
      timestamp: new Date().toISOString(),
      event,
      context,
    }));
  },
  
  warn: (event: string, context?: Record<string, any>) => {
    console.warn(JSON.stringify({
      level: "WARN",
      timestamp: new Date().toISOString(),
      event,
      context,
    }));
  },

  error: (event: string, error: any, context?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: "ERROR",
      timestamp: new Date().toISOString(),
      event,
      errorMessage: error instanceof Error ? error.message : String(error),
      context,
    }));
  }
};
