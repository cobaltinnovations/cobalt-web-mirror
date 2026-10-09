import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router-dom';
import { CobaltError } from '@/lib/http-client';
import useFlags from './use-flags';
import useHandleError from './use-handle-error';

interface LoaderDataWithResponseChecksum {
	getResponseChecksum: () => Promise<string | undefined>;
}

async function getLoaderDataChecksum(data: LoaderDataWithResponseChecksum) {
	// Polling data has not reached <Await> yet. Observe every deferred promise so
	// a rejected request cannot leave its derived data promises unhandled.
	const [checksum] = await Promise.all([
		data.getResponseChecksum(),
		Promise.all(Object.values(data).filter((value) => value instanceof Promise)),
	]);
	return checksum;
}

export function usePolledLoaderData<T extends LoaderDataWithResponseChecksum>({
	useLoaderHook,
	pollingFn,
	intervalSeconds = 45,
	immediateUpdate = false,
	enabled = true,
}: {
	useLoaderHook: () => T;
	pollingFn: () => T;
	intervalSeconds?: number;
	immediateUpdate?: boolean;
	enabled?: boolean;
}) {
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const { state } = useNavigation();
	const loaderData = useLoaderHook();
	const mounted = useRef(false);
	const pollInFlight = useRef(false);

	const isLoading = state === 'loading';
	const [isPolling, setIsPolling] = useState(false);
	const [authenticationRequired, setAuthenticationRequired] = useState(false);
	const [usingPolled, setUsingPolled] = useState(false);
	const [polledData, setPolledData] = useState(loaderData);
	const [immediateNext, setImmediateNext] = useState(false);
	const [flaggedChecksum, setFlaggedChecksum] = useState('');
	const [[uiChecksum, polledChecksum], setChecksums] = useState(['', '']);

	const hasUpdates = !!polledChecksum && uiChecksum !== polledChecksum;

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const pollLoader = useCallback(async () => {
		if (authenticationRequired || pollInFlight.current) return;

		pollInFlight.current = true;
		setIsPolling(true);

		try {
			const result = pollingFn();
			const checksum = await getLoaderDataChecksum(result);
			if (!mounted.current) return;

			setPolledData(result);
			setChecksums((curr) => {
				return [curr[0], checksum ?? ''];
			});
		} catch (error) {
			if (!mounted.current) return;

			if (error instanceof CobaltError && error.apiError?.code === 'AUTHENTICATION_REQUIRED') {
				setAuthenticationRequired(true);
			}
			handleError(error);
		} finally {
			pollInFlight.current = false;
			if (mounted.current) setIsPolling(false);
		}
	}, [authenticationRequired, handleError, pollingFn]);

	const swapData = useCallback(() => {
		setUsingPolled(true);
		setChecksums((curr) => {
			return [curr[1], curr[1]];
		});
	}, []);

	useEffect(() => {
		let canceled = false;
		setUsingPolled(false);

		getLoaderDataChecksum(loaderData)
			.then((checksum) => {
				if (canceled) return;
				setPolledData(loaderData);
				setChecksums([checksum ?? '', checksum ?? '']);
			})
			.catch(() => {
				// The route handles initial-load failures through <Await>. This
				// checksum observer must not create another unhandled rejection.
			});

		return () => {
			canceled = true;
		};
	}, [loaderData]);

	// start/stop intervals-- or update immediately
	useEffect(() => {
		if (authenticationRequired) return;

		if (!enabled) {
			setImmediateNext(true);
			return;
		}

		if (immediateNext) {
			setImmediateNext(false);
			pollLoader();
		}

		const intervalId = setInterval(() => {
			// Only perform polling if the tab is focused.
			// Don't want to do unnecessary work when tab is in the background
			if (document.visibilityState === 'visible') pollLoader();
		}, intervalSeconds * 1000);

		return () => clearInterval(intervalId);
	}, [authenticationRequired, enabled, immediateNext, intervalSeconds, pollLoader]);

	// update data immediately if configured, or display flag
	useEffect(() => {
		if (!hasUpdates) {
			return;
		}

		if (immediateUpdate) {
			swapData();
		} else if (flaggedChecksum !== polledChecksum) {
			setFlaggedChecksum(polledChecksum);

			addFlag({
				initExpanded: true,
				variant: 'bold-primary',
				title: 'New data available',
				description: 'Refresh to see the latest information',
				actions: [
					{
						title: 'Refresh screen',
						onClick: () => {
							swapData();
						},
					},
				],
			});
		}
	}, [addFlag, hasUpdates, immediateUpdate, flaggedChecksum, polledChecksum, swapData]);

	return {
		loaderData,
		polledData,
		data: usingPolled ? polledData : loaderData,
		hasUpdates,
		swapData,
		isLoading,
		isPolling,
	};
}
