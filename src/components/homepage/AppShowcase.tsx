
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TokenProps {
  symbol: string;
  className?: string;
  color: string;
  delay?: string;
  size?: string;
}

const Token = ({ symbol, className, color, delay = '0s', size = 'w-12 h-12' }: TokenProps) => {
  return (
    <div 
      className={`absolute ${size} rounded-full flex items-center justify-center 
                 shadow-lg bg-opacity-90 animate-float ${className}`}
      style={{ 
        backgroundColor: color, 
        animationDelay: delay,
        boxShadow: `0 5px 15px ${color}50`,
      }}
    >
      <span className="text-white font-bold">
        {symbol}
      </span>
    </div>
  );
};

const AppShowcase = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`relative ${isMobile ? 'h-[400px]' : 'h-[500px]'} w-full mt-8 md:mt-0`}>
      {/* Phone mockup */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
        <div className="device-frame">
          <div className="device-frame-content w-[220px] h-[440px] md:w-[260px] md:h-[520px]">
            {/* Crypto wallet interface mockup */}
            <div className="w-full h-full bg-crypto-dark flex flex-col">
              {/* Status bar */}
              <div className="h-8 w-full bg-black/40 flex items-center justify-between px-4">
                <div className="text-xs text-white">9:41</div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-crypto-green"></div>
                  <div className="text-xs text-white">Connected</div>
                </div>
              </div>
              
              {/* App header */}
              <div className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 w-full p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 8C18 4.69 15.31 2 12 2C8.69 2 6 4.69 6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M5 10H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M5 16H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-white text-sm ml-2 font-semibold">Infinity Wallet</div>
                </div>
                <div className="bg-purple-600/30 px-2 py-1 rounded-md text-xs text-white">+ Create</div>
              </div>
              
              {/* Balance area */}
              <div className="px-4 py-6 bg-gradient-to-b from-gray-900/60 to-transparent">
                <div className="text-sm text-gray-300">Total Balance</div>
                <div className="text-2xl text-white font-bold mt-1">$12,458.42</div>
                <div className="text-xs text-crypto-green mt-1">+4.21% (24h)</div>
              </div>
              
              {/* Token list */}
              <div className="flex-1 p-4 space-y-3">
                {[
                  { name: "Infinity Token", symbol: "INF", balance: "1,250.00", value: "$8,750.00", change: "+5.2%", color: "#9945FF" },
                  { name: "Solana", symbol: "SOL", balance: "12.5", value: "$1,875.00", change: "+2.1%", color: "#14F195" },
                  { name: "USDC", symbol: "USDC", balance: "1,833.42", value: "$1,833.42", change: "0.0%", color: "#2775CA" }
                ].map((token, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: token.color}}>
                      <span className="text-white text-xs font-bold">{token.symbol}</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <div className="text-sm text-white">{token.name}</div>
                        <div className="text-sm text-white">{token.value}</div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <div className="text-xs text-gray-400">{token.balance} {token.symbol}</div>
                        <div className="text-xs" style={{color: token.change.startsWith("+") ? "#14F195" : token.change === "0.0%" ? "#A7A7A7" : "#FF6B6B"}}>
                          {token.change}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom navigation */}
              <div className="h-14 bg-black/40 flex items-center justify-around">
                {['Wallet', 'Trade', 'Create', 'NFTs', 'Settings'].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-1.5 h-1.5 rounded-full mb-1 ${i === 0 ? 'bg-purple-500' : 'bg-transparent'}`}></div>
                    <div className={`text-xs ${i === 0 ? 'text-white' : 'text-gray-500'}`}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating animated tokens */}
      <div className="absolute inset-0 overflow-hidden">
        {/* SOL token */}
        <Token 
          symbol="SOL" 
          color="#9945FF" 
          className="left-[5%] top-[30%]"
          delay="0.5s" 
        />
        
        {/* INF token */}
        <Token 
          symbol="INF" 
          color="#00C2FF" 
          className="right-[10%] top-[15%]"
          delay="1.5s" 
        />
        
        {/* USDC token */}
        <Token 
          symbol="USDC" 
          color="#2775CA" 
          className="left-[15%] bottom-[20%]"
          delay="1s" 
        />
        
        {/* BTC token */}
        <Token 
          symbol="BTC" 
          color="#F7931A" 
          className="right-[15%] bottom-[25%]"
          delay="2s" 
        />
        
        {/* Small tokens */}
        <Token 
          symbol="ETH" 
          color="#627EEA" 
          size="w-8 h-8" 
          className="left-[35%] top-[10%]"
          delay="2.5s" 
        />
        
        <Token 
          symbol="DOT" 
          color="#E6007A" 
          size="w-6 h-6" 
          className="right-[30%] top-[40%]"
          delay="0.7s" 
        />
        
        <Token 
          symbol="AVAX" 
          color="#E84142" 
          size="w-7 h-7" 
          className="left-[40%] bottom-[15%]"
          delay="1.2s" 
        />
      </div>
    </div>
  );
};

export default AppShowcase;
