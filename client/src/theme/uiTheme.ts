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
  divider: "border-t-2 border-black border-dashed my-4",

  modal: {
    overlay: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm",
    container: "bg-white border-4 border-black w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative",
    header: "sticky top-0 bg-white border-b-4 border-black p-6 z-10 flex justify-between items-center",
    footer: "sticky bottom-0 bg-gray-100 border-t-4 border-black p-6 flex gap-4",
    title: "text-2xl font-black uppercase italic tracking-tighter",
  },
  form: {
    label: "block font-black uppercase text-[10px] mb-1 tracking-widest text-gray-600",
    input: "w-full border-4 border-black p-3 font-bold outline-none focus:bg-yellow-50 transition-colors",
    select: "w-full border-4 border-black p-3 font-black uppercase bg-white cursor-pointer outline-none focus:bg-yellow-50",
    toggleGroup: "flex border-4 border-black p-1 bg-gray-100",
    toggleBtnActive: "flex-1 py-2 font-black bg-black text-white transition-all",
    toggleBtnInactive: "flex-1 py-2 font-black hover:bg-gray-200 transition-all",
  },
  button: {
    primary: "bg-black text-white p-4 font-black uppercase hover:bg-green-500 hover:text-black transition-all active:translate-y-1",
    secondary: "border-4 border-black p-4 font-black uppercase bg-white hover:bg-gray-100 transition-all",
  },
  list: {
    item: "p-3 border-4 border-black cursor-pointer transition-all mb-2",
    itemSelected: "bg-black text-white",
    itemUnselected: "bg-white hover:bg-yellow-50",
  }

};

export const uiThemeNew = {
  // Global Layout
  layout: {
    main: "min-h-screen bg-gray-50 text-black font-sans pb-20",
    container: "max-w-7xl mx-auto p-4 md:p-8",
    section: "bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
  },

  // Navigation (Responsive)
  nav: {
    bar: "border-b-8 border-black bg-yellow-400 p-4 sticky top-0 z-[100]",
    logo: "text-2xl font-black italic uppercase tracking-tighter",
    desktopLink: "font-black hover:underline uppercase text-sm tracking-widest",
    mobileToggle: "md:hidden border-4 border-black bg-black text-white px-3 py-1 font-black uppercase text-xs",
    mobileOverlay: "md:hidden absolute top-[100%] left-0 w-full bg-yellow-400 border-b-8 border-black flex flex-col p-6 gap-4",
    mobileLink: "text-xl font-black border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center",
  },

  // Buttons
  button: {
    primary: "bg-black text-white p-4 font-black uppercase hover:bg-green-500 hover:text-black transition-all active:translate-y-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    secondary: "border-4 border-black p-2 font-black uppercase bg-white hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
    danger: "bg-red-500 text-white border-4 border-black p-4 font-black uppercase hover:bg-black transition-all",
  },

  // Form Elements
  form: {
    label: "block font-black uppercase text-xs mb-2 tracking-widest",
    input: "w-full border-4 border-black p-3 font-bold focus:bg-yellow-50 outline-none transition-colors",
    select: "w-full border-4 border-black p-3 font-bold bg-white appearance-none cursor-pointer",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  },

  // Modals (Responsive)
  modal: {
    overlay: "fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm",
    container: "bg-white border-t-8 md:border-4 border-black w-full max-w-2xl h-[90dvh] md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
    header: "sticky top-0 bg-white border-b-4 border-black p-6 z-10 flex justify-between items-center shrink-0",
    body: "p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar",
    footer: "sticky bottom-0 bg-gray-100 border-t-4 border-black p-6 flex gap-4 shrink-0",
  },

  // Typography
  text: {
    h1: "text-4xl md:text-6xl font-black uppercase mb-8 tracking-tighter",
    h2: "text-2xl font-black uppercase mb-4",
    p: "font-bold text-gray-700 leading-tight",
  }
};