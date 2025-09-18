'use client';

import { useCallback, useEffect, useState } from 'react';

export interface GeolocationState {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  error: GeolocationError | null;
  loading: boolean;
  timestamp: number | null;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  // Called when permission is requested
  onPermissionRequest?: () => void;
  // Called when permission is granted
  onPermissionGranted?: () => void;
  // Called when permission is denied
  onPermissionDenied?: () => void;
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  maximumAge: 30000, // 30 seconds
  timeout: 10000, // 10 seconds
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
    timestamp: null,
  });

  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      setState({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        error: null,
        loading: false,
        timestamp: position.timestamp,
      });
      options.onPermissionGranted?.();
    },
    [options]
  );

  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      let type: GeolocationError['type'] = 'POSITION_UNAVAILABLE';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          type = 'PERMISSION_DENIED';
          options.onPermissionDenied?.();
          break;
        case error.TIMEOUT:
          type = 'TIMEOUT';
          break;
        case error.POSITION_UNAVAILABLE:
          type = 'POSITION_UNAVAILABLE';
          break;
      }

      setState({
        location: null,
        error: {
          code: error.code,
          message: error.message,
          type,
        },
        loading: false,
        timestamp: null,
      });
    },
    [options]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: {
          code: -1,
          message: 'Geolocation is not supported by this browser',
          type: 'UNSUPPORTED',
        },
        loading: false,
        timestamp: null,
      });
      return;
    }

    options.onPermissionRequest?.();

    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      mergedOptions
    );

    // Watch for position updates
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      mergedOptions
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [handleError, handleSuccess, options]);

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation is not supported'));
    }

    setState(prev => ({ ...prev, loading: true }));
    options.onPermissionRequest?.();

    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position);
          resolve(position);
        },
        (error) => {
          handleError(error);
          reject(error);
        },
        { ...DEFAULT_OPTIONS, ...options }
      );
    });
  }, [handleError, handleSuccess, options]);

  return {
    ...state,
    requestPermission,
    supported: !!navigator?.geolocation,
  };
}
