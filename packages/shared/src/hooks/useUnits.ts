import { useState, useEffect, useCallback } from 'react';
import { TemperatureUnit, SpeedUnit, DistanceUnit, getStoredUnits } from '../utils/weatherHelpers';
import { AppEvents, StorageKeys, eventBus } from '../utils/eventBus';
import { safeSetItem } from '../utils/safeStorage';

export function useUnits() {
  const [units, setUnits] = useState(getStoredUnits);

  useEffect(() => {
    const handler = () => setUnits(getStoredUnits());
    const unsubscribe = eventBus.subscribe(AppEvents.UNITS_CHANGED, handler);
    return unsubscribe;
  }, []);

  const setTempUnit = useCallback((unit: TemperatureUnit) => {
    safeSetItem(StorageKeys.TEMP_UNIT, unit);
    setUnits(prev => ({ ...prev, tempUnit: unit }));
    eventBus.publish(AppEvents.UNITS_CHANGED);
  }, []);

  const setSpeedUnit = useCallback((unit: SpeedUnit) => {
    safeSetItem(StorageKeys.SPEED_UNIT, unit);
    setUnits(prev => ({ ...prev, speedUnit: unit }));
    eventBus.publish(AppEvents.UNITS_CHANGED);
  }, []);

  const setDistanceUnit = useCallback((unit: DistanceUnit) => {
    safeSetItem(StorageKeys.DISTANCE_UNIT, unit);
    setUnits(prev => ({ ...prev, distanceUnit: unit }));
    eventBus.publish(AppEvents.UNITS_CHANGED);
  }, []);

  return { ...units, setTempUnit, setSpeedUnit, setDistanceUnit };
}
