/**
 * Local Storage Service for Process Material Inspection
 * Persists submodule data to localStorage to prevent data loss when switching lines/submodules
 */

const STORAGE_PREFIX = 'process_inspection_';

/**
 * Generate storage key for a specific submodule and line
 */
const getStorageKey = (submodule, inspectionCallNo, poNo, lineNo) => {
  return `${STORAGE_PREFIX}${submodule}_${inspectionCallNo}_${poNo}_${lineNo}`;
};

/**
 * Save data to localStorage (persists across page refresh)
 */
export const saveToLocalStorage = (submodule, inspectionCallNo, poNo, lineNo, data) => {
  try {
    const key = getStorageKey(submodule, inspectionCallNo, poNo, lineNo);
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Load data from localStorage
 */
export const loadFromLocalStorage = (submodule, inspectionCallNo, poNo, lineNo) => {
  try {
    const key = getStorageKey(submodule, inspectionCallNo, poNo, lineNo);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

/**
 * Clear data from localStorage for a specific submodule
 */
export const clearFromLocalStorage = (submodule, inspectionCallNo, poNo, lineNo) => {
  try {
    const key = getStorageKey(submodule, inspectionCallNo, poNo, lineNo);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing from localStorage:', error);
    return false;
  }
};

/**
 * Get all process inspection data from localStorage for a given call/PO
 */
export const getAllProcessData = (inspectionCallNo, poNo, lineNo) => {
  const submodules = [
    'calibration',
    'staticCheck',
    'oilTank',
    'shearing',
    'turning',
    'mpi',
    'forging',
    'quenching',
    'tempering',
    'finalCheck'
  ];

  const allData = {};
  submodules.forEach(submodule => {
    const data = loadFromLocalStorage(submodule, inspectionCallNo, poNo, lineNo);
    if (data) {
      allData[submodule] = data;
    }
  });

  return allData;
};

/**
 * Clear all process inspection data from localStorage for a given call/PO/line
 */
export const clearAllProcessData = (inspectionCallNo, poNo, lineNo) => {
  const submodules = [
    'calibration',
    'staticCheck',
    'oilTank',
    'shearing',
    'turning',
    'mpi',
    'forging',
    'quenching',
    'tempering',
    'finalCheck'
  ];

  submodules.forEach(submodule => {
    clearFromLocalStorage(submodule, inspectionCallNo, poNo, lineNo);
  });
};

/**
 * Save all 8-hour grid data for a line
 */
export const saveGridDataForLine = (inspectionCallNo, poNo, lineNo, gridData) => {
  const { shearing, turning, mpi, forging, quenching, tempering, finalCheck } = gridData;
  
  if (shearing) saveToLocalStorage('shearing', inspectionCallNo, poNo, lineNo, shearing);
  if (turning) saveToLocalStorage('turning', inspectionCallNo, poNo, lineNo, turning);
  if (mpi) saveToLocalStorage('mpi', inspectionCallNo, poNo, lineNo, mpi);
  if (forging) saveToLocalStorage('forging', inspectionCallNo, poNo, lineNo, forging);
  if (quenching) saveToLocalStorage('quenching', inspectionCallNo, poNo, lineNo, quenching);
  if (tempering) saveToLocalStorage('tempering', inspectionCallNo, poNo, lineNo, tempering);
  if (finalCheck) saveToLocalStorage('finalCheck', inspectionCallNo, poNo, lineNo, finalCheck);
};

/**
 * Load all 8-hour grid data for a line
 */
export const loadGridDataForLine = (inspectionCallNo, poNo, lineNo) => {
  return {
    shearing: loadFromLocalStorage('shearing', inspectionCallNo, poNo, lineNo),
    turning: loadFromLocalStorage('turning', inspectionCallNo, poNo, lineNo),
    mpi: loadFromLocalStorage('mpi', inspectionCallNo, poNo, lineNo),
    forging: loadFromLocalStorage('forging', inspectionCallNo, poNo, lineNo),
    quenching: loadFromLocalStorage('quenching', inspectionCallNo, poNo, lineNo),
    tempering: loadFromLocalStorage('tempering', inspectionCallNo, poNo, lineNo),
    finalCheck: loadFromLocalStorage('finalCheck', inspectionCallNo, poNo, lineNo)
  };
};

