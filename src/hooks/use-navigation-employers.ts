import { useCallback, useEffect, useRef, useState } from 'react';
import { InstitutionLocation } from '@/lib/models';
import { institutionService } from '@/lib/services/institution-service';

type EmployerState = {
	institutionId: string;
	status: 'loading' | 'loaded' | 'error';
	locations: InstitutionLocation[];
};

export const useNavigationEmployers = (institutionId: string, enabled: boolean) => {
	const cache = useRef(new Map<string, InstitutionLocation[]>());
	const [attempt, setAttempt] = useState(0);
	const [state, setState] = useState<EmployerState>({ institutionId, status: 'loading', locations: [] });
	const retry = useCallback(() => setAttempt((previous) => previous + 1), []);

	useEffect(() => {
		if (!enabled) return;
		const cached = cache.current.get(institutionId);
		if (cached) {
			setState({ institutionId, status: 'loaded', locations: cached });
			return;
		}
		let active = true;
		const request = institutionService.getInstitutionLocations();
		setState({ institutionId, status: 'loading', locations: [] });
		request
			.fetch()
			.then(({ locations }) => {
				if (!active) return;
				cache.current.set(institutionId, locations);
				setState({ institutionId, status: 'loaded', locations });
			})
			.catch(() => {
				if (active) setState({ institutionId, status: 'error', locations: [] });
			});
		return () => {
			active = false;
			request.abort();
		};
	}, [institutionId, enabled, attempt]);

	return {
		...(state.institutionId === institutionId
			? state
			: { institutionId, status: 'loading' as const, locations: [] }),
		retry,
	};
};
