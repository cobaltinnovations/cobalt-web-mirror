import { useEffect } from 'react';
import useAnalytics from './use-analytics';

export default function useTrackModalView(modalName: string, isModalOpen = false) {
	const { trackModalView } = useAnalytics();

	useEffect(() => {
		if (isModalOpen) {
			trackModalView(modalName);
		}
	}, [isModalOpen, modalName, trackModalView]);

	return null;
}
