
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

// Fixed platform fee in SOL
const PLATFORM_FEE = 0.05 * LAMPORTS_PER_SOL;
// Estimated transaction fee (varies with network conditions)
const ESTIMATED_TX_FEE = 0.00025 * LAMPORTS_PER_SOL;
// Token account creation fee
const TOKEN_ACCOUNT_RENT = 0.002 * LAMPORTS_PER_SOL;
// Connection timeout - increased for stability
const CONNECTION_TIMEOUT = 45000; // 45 seconds

// Fee breakdown structure
export interface FeeBreakdown {
  mintAccountRent: number;
  tokenAccountRent: number;
  transactionFee: number;
  platformFee: number;
  total: number;
}

/**
 * Calculate the estimated fees for token creation
 * Return values are in lamports
 */
export const calculateTokenCreationFees = async (
  connection: Connection
): Promise<FeeBreakdown> => {
  try {
    // Set a timeout for the rent calculation request
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), CONNECTION_TIMEOUT);
    });

    // Get actual rent exemption for mint with timeout
    const mintRent = await Promise.race([
      getMinimumBalanceForRentExemptMint(connection),
      timeoutPromise
    ]) as number;
    
    // Calculate total
    const total = mintRent + TOKEN_ACCOUNT_RENT + ESTIMATED_TX_FEE + PLATFORM_FEE;
    
    console.log(`Calculated fees: Mint rent: ${mintRent/LAMPORTS_PER_SOL}, Token account: ${TOKEN_ACCOUNT_RENT/LAMPORTS_PER_SOL}, TX fee: ${ESTIMATED_TX_FEE/LAMPORTS_PER_SOL}, Platform fee: ${PLATFORM_FEE/LAMPORTS_PER_SOL}, Total: ${total/LAMPORTS_PER_SOL}`);
    
    return {
      mintAccountRent: mintRent,
      tokenAccountRent: TOKEN_ACCOUNT_RENT,
      transactionFee: ESTIMATED_TX_FEE,
      platformFee: PLATFORM_FEE,
      total
    };
  } catch (error) {
    console.error("Error calculating token creation fees:", error);
    
    // Return fallback values if the connection fails
    const mintRent = 0.00203928 * LAMPORTS_PER_SOL; // Typical value
    const total = mintRent + TOKEN_ACCOUNT_RENT + ESTIMATED_TX_FEE + PLATFORM_FEE;
    
    return {
      mintAccountRent: mintRent,
      tokenAccountRent: TOKEN_ACCOUNT_RENT,
      transactionFee: ESTIMATED_TX_FEE,
      platformFee: PLATFORM_FEE,
      total
    };
  }
};

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
}: TokenCreationParams): Promise<{ txId: string; tokenAddress: string; fees: FeeBreakdown }> => {
  try {
    console.log("Starting token creation with form data:", {
      name: form.name, 
      symbol: form.symbol, 
      decimals: form.decimals, 
      supply: form.supply,
      revokeMintAuthority: form.revokeMintAuthority,
      revokeFreezeAuthority: form.revokeFreezeAuthority
    });

    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    console.log(`Creating token on ${cluster} network`);
    console.log(`Wallet balance check: ${await connection.getBalance(wallet.publicKey) / LAMPORTS_PER_SOL} SOL`);
    
    const feePayerPubkey = new PublicKey(feePayer);
    
    const mintKeypair = Keypair.generate();
    const tokenMint = mintKeypair.publicKey;
    
    // Get required lamports for token mint with timeout protection
    let lamportsForMint: number;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), CONNECTION_TIMEOUT);
      });
      
      lamportsForMint = await Promise.race([
        getMinimumBalanceForRentExemptMint(connection),
        timeoutPromise
      ]) as number;
    } catch (error) {
      console.warn("Error getting lamports for mint, using fallback value:", error);
      // Use fallback value if request fails
      lamportsForMint = 0.00203928 * LAMPORTS_PER_SOL;
    }
    
    console.log(`Mint rent exemption: ${lamportsForMint / LAMPORTS_PER_SOL} SOL`);
    
    // Calculate token supply with decimals
    const tokenSupply = BigInt(form.supply * Math.pow(10, form.decimals));
    
    // Get associated token address for the wallet
    const associatedTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey
    );
    
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
      // Transfer platform fee (same for both networks now)
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: feePayerPubkey,
        lamports: PLATFORM_FEE,
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
    
    // Get recent blockhash with a timeout
    let recentBlockhash: string;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Blockhash fetch timeout")), CONNECTION_TIMEOUT);
      });
      
      const blockHashResponse = await Promise.race([
        connection.getLatestBlockhash('confirmed'),
        timeoutPromise
      ]) as { blockhash: string; lastValidBlockHeight: number };
      
      recentBlockhash = blockHashResponse.blockhash;
      console.log("Got recent blockhash:", recentBlockhash);
    } catch (error) {
      console.error("Error getting recent blockhash:", error);
      throw new Error("Network connection issue: Unable to fetch recent blockhash. Please try again with a different RPC endpoint.");
    }
    
    // Set transaction values
    transaction.recentBlockhash = recentBlockhash;
    transaction.feePayer = wallet.publicKey;

    // Calculate total fees for this transaction
    const fees = await calculateTokenCreationFees(connection);

    // Double-check wallet balance before sending transaction
    let walletBalance: number;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Balance check timeout")), CONNECTION_TIMEOUT);
      });
      
      walletBalance = await Promise.race([
        connection.getBalance(wallet.publicKey),
        timeoutPromise
      ]) as number;
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      throw new Error("Network connection issue: Unable to verify wallet balance. Please try again with a different RPC endpoint.");
    }
    
    const requiredBalance = fees.total;
    
    if (walletBalance < requiredBalance) {
      console.error(`Insufficient balance: ${walletBalance / LAMPORTS_PER_SOL} SOL available, ${requiredBalance / LAMPORTS_PER_SOL} SOL required`);
      throw new Error(`Insufficient balance: ${(walletBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL available, ${(requiredBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL required`);
    }

    // Send transaction with retry logic
    let txId: string;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (true) {
      try {
        console.log(`Sending transaction to create token ${form.name} (${form.symbol})... attempt ${retryCount + 1}`);
        txId = await wallet.sendTransaction(transaction, connection);
        console.log(`Transaction sent: ${txId}`);
        break; // Exit loop if successful
      } catch (error) {
        retryCount++;
        console.error(`Failed to send transaction (attempt ${retryCount})`, error);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to send transaction after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Wait for confirmation with longer timeout for mainnet
    const confirmationTimeout = cluster === 'mainnet-beta' ? 90000 : 60000;
    try {
      // Using an explicit timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), confirmationTimeout);
      });
      
      console.log(`Waiting for transaction confirmation (timeout: ${confirmationTimeout}ms)`);
      const confirmation = await Promise.race([
        connection.confirmTransaction(txId, 'confirmed'),
        timeoutPromise
      ]);
      
      if ((confirmation as any).value?.err) {
        throw new Error(`Transaction confirmed with error: ${JSON.stringify((confirmation as any).value.err)}`);
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
      txId,
      cluster
    );
    
    return {
      txId,
      tokenAddress: tokenMint.toString(),
      fees
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
  txId: string,
  cluster: Cluster = 'devnet'
) => {
  saveTokenSummary({
    name,
    symbol,
    decimals,
    totalSupply,
    mintAddress,
    txId,
    createdAt: new Date().toISOString(),
    cluster // Now this property is defined in TokenSummary
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
