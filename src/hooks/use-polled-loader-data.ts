import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from 'react-router-dom';
import useFlags from './use-flags';

interface LoaderDataWithResponseChecksum {
	getResponseChecksum: () => Promise<string | undefined>;
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
	const { state } = useNavigation();
	const loaderData = useLoaderHook();

	const isLoading = state === 'loading';
	const [isPolling, setIsPolling] = useState(false);
	const [usingPolled, setUsingPolled] = useState(false);
	const [polledData, setPolledData] = useState(loaderData);
	const [immediateNext, setImmediateNext] = useState(false);
	const [flaggedChecksum, setFlaggedChecksum] = useState('');
	const [[uiChecksum, polledChecksum], setChecksums] = useState(['', '']);

	const hasUpdates = !!polledChecksum && uiChecksum !== polledChecksum;

	const pollLoader = useCallback(() => {
		setIsPolling(true);
		const result = pollingFn();

		result.getResponseChecksum().then((checksum) => {
			setIsPolling(false);
			setPolledData(result);
			setChecksums((curr) => {
				return [curr[0], checksum ?? ''];
			});
		});
	}, [pollingFn]);

	const swapData = useCallback(() => {
		setUsingPolled(true);
		setChecksums((curr) => {
			return [curr[1], curr[1]];
		});
	}, []);

	useEffect(() => {
		setUsingPolled(false);

		loaderData.getResponseChecksum().then((checksum) => {
			setPolledData(loaderData);
			setChecksums([checksum ?? '', checksum ?? '']);
		});
	}, [loaderData]);

	// start/stop intervals-- or update immediately
	useEffect(() => {
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
	}, [enabled, immediateNext, intervalSeconds, pollLoader]);

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
