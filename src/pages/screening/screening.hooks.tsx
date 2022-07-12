import { OrchestratedRequest } from '@/lib/http-client';
import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseOrchestratedRequestHookOptions {
	enabled: boolean;
}

export function useOrchestratedRequest<T>(
	req: OrchestratedRequest<T>,
	options: UseOrchestratedRequestHookOptions = {
		enabled: true,
	}
) {
	const { enabled } = options;
	const [{ fetch, abort, requestComplete }, refetch] = useState(req);
	const [response, setResponse] = useState<T>();
	const [isLoading, setIsLoading] = useState(enabled);
	const [initialPromise, setInitialPromise] = useState<ReturnType<typeof req['fetch']>>();
	const abortedRef = useRef(false);

	const doFetch = useCallback(async () => {
		setIsLoading(true);
		try {
			abortedRef.current = false;

			await new Promise((res) => {
				setTimeout(() => res(1), 2000);
			});

			const promise = fetch();

			setInitialPromise((i) => {
				return i || promise;
			});

			setResponse(await promise);

			return promise;
		} catch (e) {
			return Promise.reject(e);
		} finally {
			if (abortedRef.current) {
				return;
			}

			setIsLoading(false);
		}
	}, [fetch]);

	const initialFetch = useCallback(() => {
		return initialPromise || doFetch();
	}, [doFetch, initialPromise]);

	useEffect(() => {
		if (enabled) {
			initialFetch();
		}
	}, [enabled, initialFetch]);

	useEffect(() => {
		return () => {
			if (enabled && !requestComplete) {
				abort();
			}
		};
	}, [abort, enabled, requestComplete]);

	return {
		response,
		refetch,
		isLoading,
		initialFetch,
	};
}
