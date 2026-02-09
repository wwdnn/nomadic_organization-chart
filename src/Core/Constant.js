export const DEFAULT_CONFIG = {
    spacingX: 220,
    subLevelGap: 20,    
    cardWidth: 120,     
    cardHeight: 60,     
    gapOut: 30,         
    gapIn: 60,
    supportOffset: 70   
};

export const DEFAULT_LEVEL_SETTINGS = {
    0: { label: "CEO", type: 'gradient', angle: 90, stops: [{ color: "#1e293b", pos: 0 }, { color: "#334155", pos: 100 }], activeStopIndex: 0 },
    1: { label: "VP", type: 'gradient', angle: 90, stops: [{ color: "#1d4ed8", pos: 0 }, { color: "#3b82f6", pos: 100 }], activeStopIndex: 0 },
    2: { label: "Manager", type: 'gradient', angle: 90, stops: [{ color: "#047857", pos: 0 }, { color: "#10b981", pos: 100 }], activeStopIndex: 0 },
    3: { label: "Supervisor", type: 'gradient', angle: 90, stops: [{ color: "#b45309", pos: 0 }, { color: "#f59e0b", pos: 100 }], activeStopIndex: 0 },
    4: { label: "Staff", type: 'gradient', angle: 90, stops: [{ color: "#64748b", pos: 0 }, { color: "#94a3b8", pos: 100 }], activeStopIndex: 0 }
};