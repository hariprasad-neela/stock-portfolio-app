import React, { useState, useEffect } from 'react';

export const ZerodhaManager = () => {
    const [isConnected, setIsConnected] = useState(false);
    const API_BASE = import.meta.env.VITE_API_URL || '';

    const checkStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/market/quotes?symbols=NSE:SILVERBEES`);
            if (res.ok) setIsConnected(true);
            else setIsConnected(false);
        } catch {
            setIsConnected(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const handleLogin = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/zerodha-url`);
            const { url } = await res.json();
            
            // Open Zerodha in a popup
            const width = 500, height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            
            window.open(url, 'ZerodhaLogin', `width=${width},height=${height},top=${top},left=${left}`);
        } catch (err) {
            alert("Failed to connect to backend");
        }
    };

    return (
        <div className="border-2 border-black bg-white p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
            <div>
                <h3 className="font-black text-xs uppercase tracking-tighter text-gray-500">Market Data Engine</h3>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <span className="font-black text-sm uppercase">
                        {isConnected ? 'Kite Connect Active' : 'Zerodha Offline'}
                    </span>
                </div>
            </div>
            {!isConnected && (
                <button 
                    onClick={handleLogin}
                    className="bg-yellow-400 border-2 border-black px-4 py-2 font-black text-[10px] uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    Initialize Session
                </button>
            )}
        </div>
    );
};