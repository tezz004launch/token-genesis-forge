
export interface TokenForm {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  supply: number;
  image: File | null;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
  immutableMetadata: boolean;
  website?: string;
  twitter?: string;
  telegram?: string;
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
  website?: string;
  twitter?: string;
  telegram?: string;
}
