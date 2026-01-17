import React, { useState, useEffect } from 'react';
import { API_URLS } from '../../utils/apiUrls';
import { uiTheme } from '../../theme/uiTheme';

export const ZerodhaManager = () => {
    const API_BASE = import.meta.env.VITE_API_URL || '';

    const [isConnected, setIsConnected] = useState(false);

    const checkStatus = async () => {
        try {
            const res = await fetch(API_URLS.MARKET_STATUS);
            const data = await res.json();

            if (data.status === 'active') {
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (error) {
            setIsConnected(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const handleLogin = async () => {
        try {
            const res = await fetch(API_URLS.ZERODHA_URL);
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
                    className={uiTheme.initializeBtn}
                >
                    Initialize Session
                </button>
            )}
        </div>
    );
};