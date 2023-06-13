import { useEffect, useState } from 'react';
import useFlags from './use-flags';

interface LoaderDataWithResponseChecksum {
	getResponseChecksum: () => Promise<string | undefined>;
}

export function usePolledLoaderData<T extends LoaderDataWithResponseChecksum>({
	useLoaderHook,
	pollingFn,
	intervalSeconds = 5000,
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
	const loaderData = useLoaderHook();
	const [polledData, setPolledData] = useState(loaderData);
	const [usePolled, setUsePolled] = useState(false);
	const [immediateNext, setImmediateNext] = useState(false);
	const [[currentChecksum, pendingChecksum], setChecksums] = useState(['', '']);

	const hasUpdates = !!pendingChecksum && currentChecksum !== pendingChecksum;

	useEffect(() => {
		setPolledData(loaderData);
		setUsePolled(false);
		loaderData.getResponseChecksum().then((checksum) => {
			setChecksums([checksum ?? '', checksum ?? '']);
		});
	}, [loaderData]);

	useEffect(() => {
		if (!enabled) {
			setImmediateNext(true);
			return;
		}

		if (immediateNext) {
			setPolledData(pollingFn());
			setImmediateNext(false);
		}

		const intervalId = setInterval(() => {
			const result = pollingFn();
			setPolledData(result);
			result.getResponseChecksum().then((checksum) => {
				setChecksums((curr) => {
					return [curr[0], checksum ?? ''];
				});
			});
		}, intervalSeconds);

		return () => clearInterval(intervalId);
	}, [enabled, immediateNext, intervalSeconds, pollingFn]);

	useEffect(() => {
		if (!hasUpdates) {
			return;
		} else if (immediateUpdate) {
			setUsePolled(true);
		} else {
			addFlag({
				initExpanded: true,
				variant: 'bold-primary',
				title: 'New data available',
				description: 'Refresh to see the latest information',
				actions: [
					{
						title: 'Refresh screen',
						onClick: () => {
							setUsePolled(true);
						},
					},
				],
			});
		}
	}, [addFlag, hasUpdates, immediateUpdate]);

	return {
		data: usePolled ? polledData : loaderData,
		hasUpdates,
	};
}
