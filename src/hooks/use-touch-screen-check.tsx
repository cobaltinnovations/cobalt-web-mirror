// solution found at
// developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent

import { useMemo } from 'react';

const checkIfDeviceHasTouchScreen = () => {
	let deviceHasTouchScreen = false;

	if ('maxTouchPoints' in navigator) {
		deviceHasTouchScreen = navigator.maxTouchPoints > 0;
	} else if ('msMaxTouchPoints' in navigator) {
		// @ts-ignore
		deviceHasTouchScreen = navigator.msMaxTouchPoints > 0;
	} else {
		const mQ = matchMedia?.('(pointer:coarse)');
		if (mQ?.media === '(pointer:coarse)') {
			deviceHasTouchScreen = !!mQ.matches;
		} else if ('orientation' in window) {
			deviceHasTouchScreen = true; // deprecated, but good fallback
		} else {
			// Only as a last resort, fall back to user agent sniffing
			// @ts-ignore
			const UA = navigator.userAgent;
			deviceHasTouchScreen =
				/\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
		}
	}

	return deviceHasTouchScreen;
};

export default function useTouchScreenCheck() {
	const hasTouchScreen = useMemo(checkIfDeviceHasTouchScreen, []);

	return {
		hasTouchScreen,
	};
}
