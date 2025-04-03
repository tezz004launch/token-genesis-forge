
/**
 * Token Summary Service
 * Provides functionality to store and retrieve token creation information
 */

interface TokenSummary {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  mintAddress: string;
  txId: string;
  createdAt: string;
}

const TOKEN_SUMMARY_KEY = 'token_summary';

export const saveTokenSummary = (data: TokenSummary): void => {
  try {
    localStorage.setItem(TOKEN_SUMMARY_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save token summary:', error);
  }
};

export const getTokenSummary = (): TokenSummary | null => {
  try {
    const storedData = localStorage.getItem(TOKEN_SUMMARY_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Failed to get token summary:', error);
    return null;
  }
};
