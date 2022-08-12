import { AnalyticsContext } from '@/contexts/analytics-context';
import { useContext } from 'react';

export default function useAnalytics() {
	const ctx = useContext(AnalyticsContext);

	if (!ctx) {
		throw new Error(`useAnalytics used outside its provider`);
	}

	return ctx;
}
