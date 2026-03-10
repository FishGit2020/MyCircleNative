import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import {
  useTranslation,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
  createLogger,
} from '@mycircle/shared';

const logger = createLogger('HikingMap');

interface Waypoint {
  id: string;
  lat: string;
  lon: string;
  label: string;
}

interface HikingRoute {
  id: string;
  name: string;
  waypoints: Waypoint[];
  distance: number; // km
  duration: number; // minutes
  createdAt: number;
  isPublic: boolean;
}

/** Calculate distance between two lat/lon points using Haversine formula */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Estimate walking duration from distance (km) in minutes, ~5km/h */
function estimateDuration(distanceKm: number): number {
  return Math.round((distanceKm / 5) * 60);
}

function calculateRouteStats(waypoints: Waypoint[]): { distance: number; duration: number } {
  let distance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const lat1 = parseFloat(waypoints[i].lat);
    const lon1 = parseFloat(waypoints[i].lon);
    const lat2 = parseFloat(waypoints[i + 1].lat);
    const lon2 = parseFloat(waypoints[i + 1].lon);
    if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
      distance += haversineKm(lat1, lon1, lat2, lon2);
    }
  }
  return { distance: Math.round(distance * 100) / 100, duration: estimateDuration(distance) };
}

export default function HikingMapScreen() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<HikingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: string; lon: string } | null>(null);
  const [showNewRoute, setShowNewRoute] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<HikingRoute | null>(null);
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [deleteTarget, setDeleteTarget] = useState<HikingRoute | null>(null);

  // Load routes
  const loadRoutes = useCallback(() => {
    try {
      const stored = safeGetItem(StorageKeys.HIKING_ROUTES_CACHE);
      if (stored) {
        setRoutes(JSON.parse(stored));
      }
    } catch (err) {
      logger.error('Failed to load routes', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
    const unsub = eventBus.subscribe(AppEvents.HIKING_ROUTES_CHANGED, loadRoutes);
    return unsub;
  }, [loadRoutes]);

  const saveRoutes = useCallback((updated: HikingRoute[]) => {
    setRoutes(updated);
    try {
      safeSetItem(StorageKeys.HIKING_ROUTES_CACHE, JSON.stringify(updated));
    } catch (err) {
      logger.error('Failed to save routes', err);
    }
    eventBus.publish(AppEvents.HIKING_ROUTES_CHANGED);
  }, []);

  // Get current location
  const handleLocate = useCallback(async () => {
    setLocating(true);
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('hiking.title'), t('hiking.locating'));
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        lat: loc.coords.latitude.toFixed(6),
        lon: loc.coords.longitude.toFixed(6),
      });
    } catch (err) {
      logger.error('Location failed', err);
    } finally {
      setLocating(false);
    }
  }, [t]);

  // Add waypoint
  const addWaypoint = useCallback(() => {
    setWaypoints((prev) => [
      ...prev,
      {
        id: `wp-${Date.now()}`,
        lat: currentLocation?.lat || '0',
        lon: currentLocation?.lon || '0',
        label: `${t('hiking.waypoints')} ${prev.length + 1}`,
      },
    ]);
  }, [currentLocation, t]);

  // Remove waypoint
  const removeWaypoint = useCallback((id: string) => {
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
  }, []);

  // Save new route
  const handleSaveRoute = useCallback(() => {
    if (!routeName.trim() || waypoints.length < 2) {
      Alert.alert(t('hiking.title'), t('hiking.waypoints'));
      return;
    }
    setSaving(true);
    const stats = calculateRouteStats(waypoints);
    const newRoute: HikingRoute = {
      id: `route-${Date.now()}`,
      name: routeName.trim(),
      waypoints,
      distance: stats.distance,
      duration: stats.duration,
      createdAt: Date.now(),
      isPublic: false,
    };
    saveRoutes([newRoute, ...routes]);
    setShowNewRoute(false);
    setRouteName('');
    setWaypoints([]);
    setSaving(false);
    logger.info('Route saved', { routeId: newRoute.id });
  }, [routeName, waypoints, routes, saveRoutes, t]);

  // Delete route
  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    const updated = routes.filter((r) => r.id !== deleteTarget.id);
    saveRoutes(updated);
    setDeleteTarget(null);
    if (selectedRoute?.id === deleteTarget.id) {
      setSelectedRoute(null);
    }
  }, [deleteTarget, routes, saveRoutes, selectedRoute]);

  // Toggle public
  const togglePublic = useCallback((routeId: string) => {
    const updated = routes.map((r) =>
      r.id === routeId ? { ...r, isPublic: !r.isPublic } : r,
    );
    saveRoutes(updated);
  }, [routes, saveRoutes]);

  // Share route
  const handleShare = useCallback(async (route: HikingRoute) => {
    try {
      const waypointsList = route.waypoints
        .map((wp) => `  ${wp.label}: ${wp.lat}, ${wp.lon}`)
        .join('\n');
      await Share.share({
        message: `${route.name}\n${t('hiking.distance')}: ${route.distance} km\n${t('hiking.duration')}: ${route.duration} min\n\n${waypointsList}`,
      });
    } catch (err) {
      logger.error('Share failed', err);
    }
  }, [t]);

  // Route detail view
  if (selectedRoute) {
    const stats = calculateRouteStats(selectedRoute.waypoints);
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => setSelectedRoute(null)}
            className="min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel={t('hiking.myRoutes')}
            accessibilityRole="button"
          >
            <Text className="text-blue-500 dark:text-blue-400 text-sm">
              {'\u2190'} {t('hiking.myRoutes')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleShare(selectedRoute)}
            className="min-h-[44px] min-w-[44px] justify-center items-end"
            accessibilityLabel={t('hiking.share')}
            accessibilityRole="button"
          >
            <Text className="text-blue-500 dark:text-blue-400 text-sm">{t('hiking.share')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {selectedRoute.name}
          </Text>

          {/* Stats */}
          <View className="flex-row gap-4 mb-4">
            <View className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl flex-1">
              <Text className="text-xs text-blue-500 dark:text-blue-400">{t('hiking.distance')}</Text>
              <Text className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {stats.distance} km
              </Text>
            </View>
            <View className="bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl flex-1">
              <Text className="text-xs text-green-500 dark:text-green-400">{t('hiking.duration')}</Text>
              <Text className="text-lg font-bold text-green-700 dark:text-green-300">
                {stats.duration} min
              </Text>
            </View>
          </View>

          {/* Map placeholder */}
          <View className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-4">
            <Text className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
              Map view coming soon
            </Text>
          </View>

          {/* Waypoints */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('hiking.waypoints')} ({selectedRoute.waypoints.length})
          </Text>
          {selectedRoute.waypoints.map((wp, idx) => (
            <View
              key={wp.id}
              className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800"
            >
              <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                idx === 0
                  ? 'bg-green-500 dark:bg-green-600'
                  : idx === selectedRoute.waypoints.length - 1
                  ? 'bg-red-500 dark:bg-red-600'
                  : 'bg-blue-500 dark:bg-blue-600'
              }`}>
                <Text className="text-white text-xs font-bold">{idx + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-800 dark:text-white">{wp.label}</Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {wp.lat}, {wp.lon}
                </Text>
              </View>
              {idx === 0 && (
                <Text className="text-xs text-green-500 dark:text-green-400">{t('hiking.start')}</Text>
              )}
              {idx === selectedRoute.waypoints.length - 1 && (
                <Text className="text-xs text-red-500 dark:text-red-400">{t('hiking.end')}</Text>
              )}
            </View>
          ))}

          <View className="h-20" />
        </ScrollView>
      </View>
    );
  }

  // New route form
  if (showNewRoute) {
    const stats = calculateRouteStats(waypoints);
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => { setShowNewRoute(false); setWaypoints([]); setRouteName(''); }}
            className="min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel={t('hiking.myRoutes')}
            accessibilityRole="button"
          >
            <Text className="text-blue-500 dark:text-blue-400 text-sm">{'\u2190'}</Text>
          </TouchableOpacity>
          <Text className="text-sm font-medium text-gray-800 dark:text-white">
            {t('hiking.newRoute')}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {/* Route name */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('hiking.newRoute')}
          </Text>
          <TextInput
            value={routeName}
            onChangeText={setRouteName}
            placeholder={t('hiking.newRoute')}
            placeholderTextColor="#9CA3AF"
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800 mb-4"
            accessibilityLabel={t('hiking.newRoute')}
          />

          {/* Current location */}
          <TouchableOpacity
            onPress={handleLocate}
            disabled={locating}
            className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex-row items-center justify-center min-h-[44px]"
            accessibilityLabel={t('hiking.locating')}
            accessibilityRole="button"
          >
            {locating ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <Text className="text-blue-600 dark:text-blue-400 text-sm mr-2">{'\u{1F4CD}'}</Text>
                <Text className="text-blue-600 dark:text-blue-400 text-sm">
                  {currentLocation
                    ? `${currentLocation.lat}, ${currentLocation.lon}`
                    : t('hiking.locating')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Waypoints */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('hiking.waypoints')} ({waypoints.length})
            </Text>
            <TouchableOpacity
              onPress={addWaypoint}
              className="px-3 py-1.5 bg-blue-500 dark:bg-blue-600 rounded-lg min-h-[36px] justify-center"
              accessibilityLabel={t('hiking.addWaypoint')}
              accessibilityRole="button"
            >
              <Text className="text-white text-xs font-medium">{t('hiking.addWaypoint')}</Text>
            </TouchableOpacity>
          </View>

          {waypoints.map((wp, idx) => (
            <View
              key={wp.id}
              className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2"
            >
              <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                idx === 0
                  ? 'bg-green-500 dark:bg-green-600'
                  : idx === waypoints.length - 1 && waypoints.length > 1
                  ? 'bg-red-500 dark:bg-red-600'
                  : 'bg-blue-500 dark:bg-blue-600'
              }`}>
                <Text className="text-white text-xs font-bold">{idx + 1}</Text>
              </View>
              <View className="flex-1">
                <TextInput
                  value={wp.label}
                  onChangeText={(text) => {
                    setWaypoints((prev) =>
                      prev.map((w) => (w.id === wp.id ? { ...w, label: text } : w)),
                    );
                  }}
                  className="text-sm text-gray-800 dark:text-white mb-1"
                  accessibilityLabel={wp.label}
                />
                <View className="flex-row gap-2">
                  <TextInput
                    value={wp.lat}
                    onChangeText={(text) => {
                      setWaypoints((prev) =>
                        prev.map((w) => (w.id === wp.id ? { ...w, lat: text } : w)),
                      );
                    }}
                    placeholder="Lat"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="flex-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                    accessibilityLabel="Latitude"
                  />
                  <TextInput
                    value={wp.lon}
                    onChangeText={(text) => {
                      setWaypoints((prev) =>
                        prev.map((w) => (w.id === wp.id ? { ...w, lon: text } : w)),
                      );
                    }}
                    placeholder="Lon"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="flex-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                    accessibilityLabel="Longitude"
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeWaypoint(wp.id)}
                className="ml-2 min-h-[44px] min-w-[44px] items-center justify-center"
                accessibilityLabel={t('hiking.removeWaypoint')}
                accessibilityRole="button"
              >
                <Text className="text-red-500 dark:text-red-400">{'\u2715'}</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Route stats preview */}
          {waypoints.length >= 2 && (
            <View className="flex-row gap-4 mt-4 mb-4">
              <View className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl flex-1">
                <Text className="text-xs text-blue-500 dark:text-blue-400">{t('hiking.distance')}</Text>
                <Text className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {stats.distance} km
                </Text>
              </View>
              <View className="bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl flex-1">
                <Text className="text-xs text-green-500 dark:text-green-400">{t('hiking.duration')}</Text>
                <Text className="text-lg font-bold text-green-700 dark:text-green-300">
                  ~{stats.duration} min
                </Text>
              </View>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSaveRoute}
            disabled={saving || !routeName.trim() || waypoints.length < 2}
            className={`mt-4 px-6 py-4 rounded-xl min-h-[48px] justify-center items-center ${
              saving || !routeName.trim() || waypoints.length < 2
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-green-500 dark:bg-green-600'
            }`}
            accessibilityLabel={t('hiking.save')}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">{t('hiking.save')}</Text>
            )}
          </TouchableOpacity>

          <View className="h-20" />
        </ScrollView>
      </View>
    );
  }

  // Main route list view
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const myRoutes = routes.filter(() => true);
  const publicRoutes = routes.filter((r) => r.isPublic);
  const displayedRoutes = tab === 'my' ? myRoutes : publicRoutes;

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4 pb-20" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4 mt-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('hiking.title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('hiking.subtitle')}
          </Text>
        </View>

        {/* Map placeholder banner */}
        <View className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-4">
          <Text className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
            Map view coming soon — use the text-based route planner below
          </Text>
        </View>

        {/* New route button */}
        <TouchableOpacity
          onPress={() => setShowNewRoute(true)}
          className="mb-4 px-4 py-3 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[48px] justify-center items-center"
          accessibilityLabel={t('hiking.newRoute')}
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">{t('hiking.newRoute')}</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => setTab('my')}
            className={`flex-1 py-2 rounded-l-xl min-h-[44px] justify-center items-center ${
              tab === 'my' ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'
            }`}
            accessibilityLabel={t('hiking.myRoutes')}
            accessibilityRole="button"
          >
            <Text className={`text-sm font-medium ${
              tab === 'my' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {t('hiking.myRoutes')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('public')}
            className={`flex-1 py-2 rounded-r-xl min-h-[44px] justify-center items-center ${
              tab === 'public' ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'
            }`}
            accessibilityLabel={t('hiking.publicRoutes')}
            accessibilityRole="button"
          >
            <Text className={`text-sm font-medium ${
              tab === 'public' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {t('hiking.publicRoutes')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Route list */}
        {displayedRoutes.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-4xl mb-4">{'\u{1F6B6}'}</Text>
            <Text className="text-gray-500 dark:text-gray-400">
              {t('hiking.noRoutes')}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {displayedRoutes.map((route) => (
              <TouchableOpacity
                key={route.id}
                onPress={() => setSelectedRoute(route)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                accessibilityLabel={route.name}
                accessibilityRole="button"
              >
                <Text className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                  {route.name}
                </Text>
                <View className="flex-row gap-4 mb-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {t('hiking.distance')}: {route.distance} km
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {t('hiking.duration')}: {route.duration} min
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {t('hiking.waypoints')}: {route.waypoints.length}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => togglePublic(route.id)}
                    className="px-3 py-1.5 rounded-full min-h-[32px] justify-center bg-gray-100 dark:bg-gray-700"
                    accessibilityLabel={t('hiking.share')}
                    accessibilityRole="button"
                  >
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {route.isPublic ? t('hiking.publicRoutes') : t('hiking.share')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDeleteTarget(route)}
                    className="px-3 py-1.5 rounded-full min-h-[32px] justify-center"
                    accessibilityLabel={t('hiking.save')}
                    accessibilityRole="button"
                  >
                    <Text className="text-xs text-red-500 dark:text-red-400">{'\u2715'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
          <View className="flex-1 justify-center items-center bg-black/50 px-4">
            <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
              <Text className="text-gray-800 dark:text-white mb-4">
                {t('hiking.save')} &quot;{deleteTarget.name}&quot;?
              </Text>
              <View className="flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('hiking.myRoutes')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-400">{'\u2190'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-red-500 dark:bg-red-600"
                  accessibilityLabel={t('hiking.title')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium text-white">{'\u2715'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
