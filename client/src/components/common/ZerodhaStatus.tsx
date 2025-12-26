import React from 'react';

export const ZerodhaStatus = () => {
    const handleLogin = async () => {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        try {
            const res = await fetch(`${API_BASE}/api/auth/zerodha-url`);
            const { url } = await res.json();
            // Open Zerodha login in a new tab
            window.open(url, '_blank');
        } catch (err) {
            alert("Could not get login URL");
        }
    };

    return (
        <div className="bg-white border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
            <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Connection Status</span>
                <p className="font-black text-sm">ZERODHA KITE</p>
            </div>
            <button 
                onClick={handleLogin}
                className="bg-yellow-400 border-2 border-black px-4 py-2 text-[10px] font-black uppercase hover:bg-yellow-500 transition-all"
            >
                Connect Live Data
            </button>
        </div>
    );
};