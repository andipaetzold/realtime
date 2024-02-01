import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimeWebSocketClient } from "@andipaetzold/realtime-websocket-client";

export function useRealtimeValue<T = unknown>(
  realtimeClient: RealtimeWebSocketClient,
  pathOrQuery: string | undefined
): [T | null, false] | [undefined, true] {
  const { loading, setLoading, setValue, value } = useLoadingValue<T | null>();

  useEffect(() => {
    setLoading();

    const listener = (newValue: T) => {
      setValue(newValue);
    };

    if (!pathOrQuery) {
      setValue(null);
      return;
    }

    if (pathOrQuery.startsWith("/")) {
      return realtimeClient.subscribeByPath<T>(pathOrQuery, listener);
    } else {
      return realtimeClient.subscribeByQuery<T>(pathOrQuery, listener);
    }
  }, [pathOrQuery, setLoading, setValue]);

  return [value, loading] as [T | null, false] | [undefined, true];
}

function useLoadingValue<Value>() {
  const [state, setState] = useState<{
    value: Value | undefined;
    loading: boolean;
  }>({
    loading: true,
    value: undefined,
  });

  const setValue = useCallback((value?: Value) => {
    setState({ value, loading: false });
  }, []);

  const setLoading = useCallback(() => {
    setState({ value: undefined, loading: true });
  }, []);

  return useMemo(
    () => ({
      value: state.value,
      setValue,
      loading: state.loading,
      setLoading,
    }),
    [state, setValue, setLoading]
  );
}
