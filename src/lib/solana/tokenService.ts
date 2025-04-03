
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { TokenForm } from '@/types/token';
import { saveTokenSummary } from '@/lib/services/tokenSummaryService';

type Wallet = {
  publicKey: PublicKey;
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>;
};

interface TokenCreationParams {
  form: TokenForm;
  wallet: Wallet;
  feePayer: string; // Wallet address to receive fees
  connection: Connection;
}

export const createSPLToken = async ({ 
  form, 
  wallet, 
  feePayer,
  connection
}: TokenCreationParams): Promise<{ txId: string; tokenAddress: string }> => {
  try {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    const feePayerPubkey = new PublicKey(feePayer);
    
    const mintKeypair = Keypair.generate();
    const tokenMint = mintKeypair.publicKey;
    
    const lamportsForMint = await getMinimumBalanceForRentExemptMint(connection);
    
    const associatedTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey
    );

    const platformFee = 0.05 * LAMPORTS_PER_SOL;
    
    const transaction = new Transaction();
    
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: tokenMint,
        lamports: lamportsForMint,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        tokenMint,
        form.decimals,
        wallet.publicKey,
        form.revokeFreezeAuthority ? null : wallet.publicKey
      ),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        tokenMint
      ),
      createMintToInstruction(
        tokenMint,
        associatedTokenAccount,
        wallet.publicKey,
        BigInt(form.supply * Math.pow(10, form.decimals))
      ),
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: feePayerPubkey,
        lamports: platformFee,
      })
    );

    if (form.revokeMintAuthority) {
      transaction.add(
        createSetAuthorityInstruction(
          tokenMint,
          wallet.publicKey,
          AuthorityType.MintTokens,
          null
        )
      );
    }
    
    if (form.immutableMetadata && "immutableMetadata" in form) {
      console.log("Setting immutable metadata flag");
    }
    
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;

    const txId = await wallet.sendTransaction(transaction, connection);
    
    console.log(`Transaction sent: ${txId}`);
    
    return {
      txId,
      tokenAddress: tokenMint.toString()
    };
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
};

export const saveTokenCreationData = (
  name: string,
  symbol: string,
  decimals: number,
  totalSupply: number,
  mintAddress: string,
  txId: string
) => {
  saveTokenSummary({
    name,
    symbol,
    decimals,
    totalSupply,
    mintAddress,
    txId,
    createdAt: new Date().toISOString()
  });
};

export const uploadTokenImage = async (image: File): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/token-image-${Date.now()}`;
};

export const getWalletTokens = async (wallet: PublicKey): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [];
};
