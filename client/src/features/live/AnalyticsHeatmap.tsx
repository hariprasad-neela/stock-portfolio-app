import React, { useLayoutEffect, useRef, useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';


// Color palette for performance intensity
const COLORS = {
    strongLoss: '#ef4444', // Deep Red
    mildLoss: '#fca5a5',   // Soft Red
    neutral: '#fde047',    // Yellow
    mildGain: '#86efac',   // Soft Green
    strongGain: '#22c55e', // Bright Green
};

const getHeatmapColor = (roi: number) => {
    if (roi <= -5) return COLORS.strongLoss;
    if (roi < 0) return COLORS.mildLoss;
    if (roi === 0) return COLORS.neutral;
    if (roi < 5) return COLORS.mildGain;
    return COLORS.strongGain;
};

const CustomTreemapRect = (props: any) => {
    const { x, y, width, height, name, roi } = props;

    // 1. GUARD: If roi is undefined or null, this is likely a root/group node.
    // We return a transparent rect or null to prevent the .toFixed crash.
    if (roi === undefined || roi === null) {
        return <rect x={x} y={y} width={width} height={height} fill="transparent" />;
    }

    // 2. Logic for valid data points
    const showText = width > 60 && height > 40;
    const fontSize = Math.min(width / 6, 16);

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: getHeatmapColor(roi),
                    stroke: '#000',
                    strokeWidth: 3,
                }}
            />
            {showText && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 - 5}
                        textAnchor="middle"
                        fill="black"
                        style={{
                            fontSize: `${fontSize}px`,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                        }}
                    >
                        {name}
                    </text>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 12}
                        textAnchor="middle"
                        fill="black"
                        style={{
                            fontSize: `${fontSize * 0.8}px`,
                            fontWeight: 700
                        }}
                    >
                        {/* Now safe to call .toFixed */}
                        {roi > 0 ? `+${roi.toFixed(1)}%` : `${roi.toFixed(1)}%`}
                    </text>
                </>
            )}
        </g>
    );
};

export const AnalyticsHeatmap = ({ data }: { data: any[] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    // Use useLayoutEffect to measure the DOM before the browser paints
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const observeTarget = containerRef.current;
        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                setSize({ width, height });
            }
        });

        resizeObserver.observe(observeTarget);
        return () => resizeObserver.unobserve(observeTarget);
    }, []);

    return (
        <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase italic mb-6">Portfolio Heatmap</h2>

            {/* We wrap the chart in a div with a fixed aspect ratio or height.
          The ResponsiveContainer will now only render if size.width > 0.
      */}
            <div
                ref={containerRef}
                className="h-[400px] w-full border-4 border-black bg-slate-50 relative overflow-hidden"
            >
                {size.width > 0 && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey="size"
                            stroke="#000"
                            isAnimationActive={false}
                            content={<CustomTreemapRect />} // Ensure the Guard fix from before is here
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center font-black italic">
                        CALCULATING DIMENSIONS...
                    </div>
                )}
            </div>
        </section>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.roi >= 0;

    return (
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[180px]">
        <p className="text-xl font-black uppercase italic mb-1 border-b-2 border-black pb-1">
          {data.name}
        </p>
        <div className="space-y-1 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-gray-500">Value</span>
            <span className="font-black text-sm">
              ₹{data.size.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-gray-500">ROI</span>
            <span className={`font-black text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{data.roi.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-gray-500">LTP</span>
            <span className="font-black text-sm">₹{data.currentPrice}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};