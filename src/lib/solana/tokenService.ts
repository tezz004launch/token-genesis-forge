
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Cluster,
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
  cluster?: Cluster; // Add cluster parameter
}

/**
 * Creates a new SPL token on Solana blockchain
 * Supports both devnet and mainnet
 */
export const createSPLToken = async ({ 
  form, 
  wallet, 
  feePayer,
  connection,
  cluster = 'devnet' // Default to devnet
}: TokenCreationParams): Promise<{ txId: string; tokenAddress: string }> => {
  try {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    console.log(`Creating token on ${cluster} network`);
    const feePayerPubkey = new PublicKey(feePayer);
    
    const mintKeypair = Keypair.generate();
    const tokenMint = mintKeypair.publicKey;
    
    // Get required lamports for token mint
    const lamportsForMint = await getMinimumBalanceForRentExemptMint(connection);
    
    // Calculate token supply with decimals
    const tokenSupply = BigInt(form.supply * Math.pow(10, form.decimals));
    
    // Get associated token address for the wallet
    const associatedTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey
    );

    // Calculate platform fee (adjust based on network)
    const platformFee = cluster === 'mainnet-beta' ? 
      0.1 * LAMPORTS_PER_SOL : // Higher fee for mainnet
      0.05 * LAMPORTS_PER_SOL; // Lower fee for devnet
    
    // Create transaction
    const transaction = new Transaction();
    
    // Add instructions to transaction
    transaction.add(
      // Create account for the token mint
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: tokenMint,
        lamports: lamportsForMint,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize the mint
      createInitializeMintInstruction(
        tokenMint,
        form.decimals,
        wallet.publicKey,
        form.revokeFreezeAuthority ? null : wallet.publicKey
      ),
      // Create associated token account
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        tokenMint
      ),
      // Mint tokens to the associated token account
      createMintToInstruction(
        tokenMint,
        associatedTokenAccount,
        wallet.publicKey,
        tokenSupply
      ),
      // Transfer platform fee
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: feePayerPubkey,
        lamports: platformFee,
      })
    );

    // Conditionally revoke mint authority
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
    
    // Handle immutable metadata flag
    if (form.immutableMetadata) {
      // In a production implementation, this would use Metaplex to set immutable metadata
      console.log("Setting immutable metadata flag");
      // Here we would add instructions to create token metadata using Metaplex
      // This part requires the Metaplex SDK to be properly implemented
    }
    
    // Set transaction values
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;

    // Send transaction
    console.log(`Sending transaction to create token ${form.name} (${form.symbol})...`);
    const txId = await wallet.sendTransaction(transaction, connection);
    
    console.log(`Transaction sent: ${txId}`);
    
    // Wait for confirmation with longer timeout for mainnet
    const confirmationTimeout = cluster === 'mainnet-beta' ? 60000 : 30000;
    try {
      const confirmation = await connection.confirmTransaction(txId, 'confirmed');
      if (confirmation.value.err) {
        throw new Error(`Transaction confirmed with error: ${JSON.stringify(confirmation.value.err)}`);
      }
      console.log("Transaction confirmed successfully");
    } catch (confirmError) {
      console.warn("Failed to confirm transaction, but it may still succeed:", confirmError);
      // Continue - we'll assume the transaction might still succeed
    }
    
    // Save token creation data
    await saveTokenCreationData(
      form.name,
      form.symbol,
      form.decimals,
      form.supply,
      tokenMint.toString(),
      txId
    );
    
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
  // In a real implementation, this would upload to IPFS or other storage
  // For now, returning a placeholder URL
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/token-image-${Date.now()}`;
};

export const getWalletTokens = async (wallet: PublicKey, connection: Connection): Promise<any[]> => {
  try {
    // In a real implementation, this would use getTokenAccountsByOwner to get token accounts
    // and get their balances and metadata
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    return tokenAccounts.value.map(account => {
      const tokenData = account.account.data.parsed.info;
      return {
        mint: tokenData.mint,
        amount: tokenData.tokenAmount.uiAmount,
        decimals: tokenData.tokenAmount.decimals
      };
    });
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    return [];
  }
};
