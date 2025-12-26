import React, { useState } from 'react';
import { uiTheme } from '../../theme/uiTheme';

export const ZerodhaAuth = () => {
    const [isConnected, setIsConnected] = useState(false);

    const handleLogin = async () => {
        const res = await fetch('/api/auth/zerodha-login');
        const { url } = await res.json();
        // Open Zerodha login in a popup
        window.open(url, 'Zerodha Login', 'width=600,height=600');
    };

    return (
        <div className={uiTheme.card + " mb-6 py-4 flex justify-between items-center"}>
            <div>
                <span className={uiTheme.label}>Market Data Connection</span>
                <h3 className="font-black text-sm uppercase">
                    Zerodha Kite Connect {isConnected ? '🟢 Active' : '🔴 Disconnected'}
                </h3>
            </div>
            {!isConnected && (
                <button onClick={handleLogin} className={uiTheme.btnPrimary + " py-2 text-[10px]"}>
                    Connect Zerodha
                </button>
            )}
        </div>
    );
};