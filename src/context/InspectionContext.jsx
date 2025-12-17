import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Inspection Context - Provides shared state across all inspection pages
 * Handles: selectedCall, heats, productModel, processLines, etc.
 */

const InspectionContext = createContext(null);

export const InspectionProvider = ({ children }) => {
  // Selected call from landing page
  const [selectedCall, setSelectedCall] = useState(() => {
    const saved = sessionStorage.getItem('selectedCall');
    return saved ? JSON.parse(saved) : null;
  });

  // Multiple calls for batch inspection
  const [selectedCalls, setSelectedCalls] = useState(() => {
    const saved = sessionStorage.getItem('selectedCalls');
    return saved ? JSON.parse(saved) : [];
  });

  // Active inspection type: 'raw-material', 'process', 'final-product'
  const [activeInspectionType, setActiveInspectionType] = useState(() => {
    return sessionStorage.getItem('activeInspectionType') || null;
  });

  // Raw Material shared state
  const [rmHeats, setRmHeats] = useState(() => {
    const saved = sessionStorage.getItem('rmHeats');
    return saved ? JSON.parse(saved) : [{ heatNo: '', weight: '' }];
  });

  const [rmProductModel, setRmProductModel] = useState(() => {
    return sessionStorage.getItem('rmProductModel') || 'MK-III';
  });

  // Process shared state
  const [processShift, setProcessShift] = useState(() => {
    return sessionStorage.getItem('processShift') || 'A';
  });

  const [processSelectedLines, setProcessSelectedLines] = useState(() => {
    const saved = sessionStorage.getItem('processSelectedLines');
    return saved ? JSON.parse(saved) : ['Line-1'];
  });

  const [processLotNumbers] = useState(['LOT-001', 'LOT-002', 'LOT-003']);

  // Landing page active tab
  const [landingActiveTab, setLandingActiveTab] = useState('pending');

  // Persist to sessionStorage on change
  const updateSelectedCall = useCallback((call) => {
    setSelectedCall(call);
    if (call) {
      sessionStorage.setItem('selectedCall', JSON.stringify(call));
    } else {
      sessionStorage.removeItem('selectedCall');
    }
  }, []);

  const updateSelectedCalls = useCallback((calls) => {
    setSelectedCalls(calls);
    if (calls.length > 0) {
      sessionStorage.setItem('selectedCalls', JSON.stringify(calls));
    } else {
      sessionStorage.removeItem('selectedCalls');
    }
  }, []);

  const updateActiveInspectionType = useCallback((type) => {
    setActiveInspectionType(type);
    if (type) {
      sessionStorage.setItem('activeInspectionType', type);
    } else {
      sessionStorage.removeItem('activeInspectionType');
    }
  }, []);

  const updateRmHeats = useCallback((heats) => {
    setRmHeats(heats);
    sessionStorage.setItem('rmHeats', JSON.stringify(heats));
  }, []);

  const updateRmProductModel = useCallback((model) => {
    setRmProductModel(model);
    sessionStorage.setItem('rmProductModel', model);
  }, []);

  const updateProcessShift = useCallback((shift) => {
    setProcessShift(shift);
    sessionStorage.setItem('processShift', shift);
  }, []);

  const updateProcessSelectedLines = useCallback((lines) => {
    setProcessSelectedLines(lines);
    sessionStorage.setItem('processSelectedLines', JSON.stringify(lines));
  }, []);

  // Clear all inspection data (on logout or navigation reset)
  const clearInspectionData = useCallback(() => {
    setSelectedCall(null);
    setSelectedCalls([]);
    setActiveInspectionType(null);
    setRmHeats([{ heatNo: '', weight: '' }]);
    setRmProductModel('MK-III');
    setProcessShift('A');
    setProcessSelectedLines(['Line-1']);
    setLandingActiveTab('pending');

    sessionStorage.removeItem('selectedCall');
    sessionStorage.removeItem('selectedCalls');
    sessionStorage.removeItem('activeInspectionType');
    sessionStorage.removeItem('rmHeats');
    sessionStorage.removeItem('rmProductModel');
    sessionStorage.removeItem('processShift');
    sessionStorage.removeItem('processSelectedLines');
  }, []);

  const value = {
    selectedCall,
    selectedCalls,
    activeInspectionType,
    rmHeats,
    rmProductModel,
    processShift,
    processSelectedLines,
    processLotNumbers,
    landingActiveTab,
    setSelectedCall: updateSelectedCall,
    setSelectedCalls: updateSelectedCalls,
    setActiveInspectionType: updateActiveInspectionType,
    setRmHeats: updateRmHeats,
    setRmProductModel: updateRmProductModel,
    setProcessShift: updateProcessShift,
    setProcessSelectedLines: updateProcessSelectedLines,
    setLandingActiveTab,
    clearInspectionData,
  };

  return (
    <InspectionContext.Provider value={value}>
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within an InspectionProvider');
  }
  return context;
};

export default InspectionContext;

