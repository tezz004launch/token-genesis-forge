
export interface TokenForm {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  supply: number;
  image: File | null;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  createdAt: string;
  owner: string;
  imageUrl?: string;
}
