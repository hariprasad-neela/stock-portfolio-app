export const uiTheme = {
  // Main background (light gray/blue from the demo)
  wrapper: "min-h-screen bg-[#f3f4f6] text-[#1a1a1a] font-sans pb-10",
  container: "max-w-[1600px] mx-auto px-6",
  
  // Navigation / Sidebar area
  nav: "bg-white border-b-2 border-black sticky top-0 z-50 mb-6",
  navInner: "flex justify-between h-16 items-center px-6",
  navLink: "px-4 py-2 font-black uppercase tracking-widest text-[11px] hover:bg-gray-100 transition-all border-r border-black last:border-r-0 h-full flex items-center",

  // The "Brutal" Card
  card: "bg-white border-2 border-black rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
  
  // Status Cards (Pastel logic from the reference)
  cardSuccess: "bg-[#dcfce7] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  cardInfo: "bg-[#dbeafe] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  cardWarning: "bg-[#fef9c3] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",

  // Typography
  displayValue: "text-3xl font-black tracking-tight mt-1",
  label: "text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 block mb-1",
  
  // Buttons
  btnPrimary: "bg-black text-white px-6 py-2 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]",

  // Table styles (Clean & Sharp)
  tableWrapper: "w-full overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  table: "w-full border-collapse text-left",
  tableHeader: "bg-gray-50 border-b-2 border-black p-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400",
  tableRow: "border-b border-gray-200 hover:bg-blue-50/30 transition-colors cursor-pointer",
  tableCell: "p-4 text-sm font-bold text-slate-900",
  badge: "px-2 py-1 border border-black text-[9px] font-black uppercase rounded-sm shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",

//Sidar styles
sidebar: "bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24 h-fit",
  metricBox: "bg-gray-50 border border-black p-3 mb-4",
  metricValue: "text-xl font-black tracking-tight leading-none",
  metricLabel: "text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 block",
  divider: "border-t-2 border-black border-dashed my-4"
    
};