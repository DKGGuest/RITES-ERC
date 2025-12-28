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

  // Inspection shift and date (from Initiation page)
  const [inspectionShift, setInspectionShift] = useState(() => {
    return sessionStorage.getItem('inspectionShift') || '';
  });

  const [inspectionDate, setInspectionDate] = useState(() => {
    return sessionStorage.getItem('inspectionDate') || '';
  });

  // Raw Material shared state
  const [rmHeats, setRmHeats] = useState(() => {
    const saved = sessionStorage.getItem('rmHeats');
    return saved ? JSON.parse(saved) : [{ heatNo: '', weight: '' }];
  });

  const [rmProductModel, setRmProductModel] = useState(() => {
    return sessionStorage.getItem('rmProductModel') || 'MK-III';
  });

  // Raw Material Ladle Values (vendor chemical composition from database)
  const [rmLadleValues, setRmLadleValues] = useState(() => {
    const saved = sessionStorage.getItem('rmLadleValues');
    return saved ? JSON.parse(saved) : null;
  });

  // Process shared state
  const [processShift, setProcessShift] = useState(() => {
    return sessionStorage.getItem('processShift') || 'A';
  });

  const [processSelectedLines, setProcessSelectedLines] = useState(() => {
    const saved = sessionStorage.getItem('processSelectedLines');
    return saved ? JSON.parse(saved) : ['Line-1'];
  });

  const [processProductionLines, setProcessProductionLines] = useState(() => {
    const saved = sessionStorage.getItem('processProductionLines');
    return saved ? JSON.parse(saved) : [];
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

  const updateRmLadleValues = useCallback((values) => {
    setRmLadleValues(values);
    if (values) {
      sessionStorage.setItem('rmLadleValues', JSON.stringify(values));
    } else {
      sessionStorage.removeItem('rmLadleValues');
    }
  }, []);

  const updateProcessShift = useCallback((shift) => {
    setProcessShift(shift);
    sessionStorage.setItem('processShift', shift);
  }, []);

  const updateProcessSelectedLines = useCallback((lines) => {
    setProcessSelectedLines(lines);
    sessionStorage.setItem('processSelectedLines', JSON.stringify(lines));
  }, []);

  const updateProcessProductionLines = useCallback((lines) => {
    setProcessProductionLines(lines);
    sessionStorage.setItem('processProductionLines', JSON.stringify(lines));
  }, []);

  const updateInspectionShift = useCallback((shift) => {
    setInspectionShift(shift);
    if (shift) {
      sessionStorage.setItem('inspectionShift', shift);
    } else {
      sessionStorage.removeItem('inspectionShift');
    }
  }, []);

  const updateInspectionDate = useCallback((date) => {
    setInspectionDate(date);
    if (date) {
      sessionStorage.setItem('inspectionDate', date);
    } else {
      sessionStorage.removeItem('inspectionDate');
    }
  }, []);

  // Clear all inspection data (on logout or navigation reset)
  const clearInspectionData = useCallback(() => {
    setSelectedCall(null);
    setSelectedCalls([]);
    setActiveInspectionType(null);
    setInspectionShift('');
    setInspectionDate('');
    setRmHeats([{ heatNo: '', weight: '' }]);
    setRmProductModel('MK-III');
    setRmLadleValues(null);
    setProcessShift('A');
    setProcessSelectedLines(['Line-1']);
    setProcessProductionLines([]);
    setLandingActiveTab('pending');

    sessionStorage.removeItem('selectedCall');
    sessionStorage.removeItem('selectedCalls');
    sessionStorage.removeItem('activeInspectionType');
    sessionStorage.removeItem('inspectionShift');
    sessionStorage.removeItem('inspectionDate');
    sessionStorage.removeItem('rmHeats');
    sessionStorage.removeItem('rmProductModel');
    sessionStorage.removeItem('rmLadleValues');
    sessionStorage.removeItem('processShift');
    sessionStorage.removeItem('processSelectedLines');
    sessionStorage.removeItem('processProductionLines');
  }, []);

  const value = {
    selectedCall,
    selectedCalls,
    activeInspectionType,
    inspectionShift,
    inspectionDate,
    rmHeats,
    rmProductModel,
    rmLadleValues,
    processShift,
    processSelectedLines,
    processProductionLines,
    processLotNumbers,
    landingActiveTab,
    setSelectedCall: updateSelectedCall,
    setSelectedCalls: updateSelectedCalls,
    setActiveInspectionType: updateActiveInspectionType,
    setInspectionShift: updateInspectionShift,
    setInspectionDate: updateInspectionDate,
    setRmHeats: updateRmHeats,
    setRmProductModel: updateRmProductModel,
    setRmLadleValues: updateRmLadleValues,
    setProcessShift: updateProcessShift,
    setProcessSelectedLines: updateProcessSelectedLines,
    setProcessProductionLines: updateProcessProductionLines,
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

