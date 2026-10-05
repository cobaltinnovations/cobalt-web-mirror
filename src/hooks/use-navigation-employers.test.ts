import { act, renderHook } from '@testing-library/react';
import { institutionService } from '@/lib/services/institution-service';
import { InstitutionLocation } from '@/lib/models';
import { useNavigationEmployers } from './use-navigation-employers';

jest.mock('@/lib/services/institution-service', () => ({ institutionService: { getInstitutionLocations: jest.fn() } }));
const getLocations = institutionService.getInstitutionLocations as jest.Mock;
const location = { institutionId: 'COBALT', institutionLocationId: 'employer', name: 'Employer' };
const request = () => {
	let resolve!: (value: { locations: InstitutionLocation[] }) => void;
	let reject!: (reason: Error) => void;
	const promise = new Promise<{ locations: InstitutionLocation[] }>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	const result = { fetch: jest.fn(() => promise), abort: jest.fn(), resolve, reject };
	getLocations.mockReturnValueOnce(result);
	return result;
};

beforeEach(() => getLocations.mockReset());

it('fetches once per institution and reuses successful results, including empty lists', async () => {
	const first = request();
	const second = request();
	const { result, rerender } = renderHook(({ id }) => useNavigationEmployers(id, true), {
		initialProps: { id: 'COBALT' },
	});
	expect(result.current.status).toBe('loading');
	await act(async () => first.resolve({ locations: [location] }));
	expect(result.current.locations).toEqual([location]);
	rerender({ id: 'COBALT' });
	expect(getLocations).toHaveBeenCalledTimes(1);
	rerender({ id: 'OTHER' });
	expect(first.abort).toHaveBeenCalledTimes(1);
	await act(async () => second.resolve({ locations: [] }));
	rerender({ id: 'COBALT' });
	expect(result.current.locations).toEqual([location]);
	rerender({ id: 'OTHER' });
	expect(result.current.status).toBe('loaded');
	expect(result.current.locations).toEqual([]);
	expect(getLocations).toHaveBeenCalledTimes(2);
});

it('aborts stale requests and ignores late responses from a previous institution', async () => {
	const first = request();
	const second = request();
	const { result, rerender, unmount } = renderHook(({ id }) => useNavigationEmployers(id, true), {
		initialProps: { id: 'COBALT' },
	});
	rerender({ id: 'OTHER' });
	expect(first.abort).toHaveBeenCalledTimes(1);
	await act(async () => first.resolve({ locations: [location] }));
	expect(result.current.status).toBe('loading');
	expect(result.current.locations).toEqual([]);
	await act(async () => second.resolve({ locations: [] }));
	unmount();
	expect(second.abort).toHaveBeenCalledTimes(1);
});

it('exposes a retry after failure and cancels on unmount without updating state', async () => {
	const first = request();
	const second = request();
	const { result, unmount } = renderHook(() => useNavigationEmployers('COBALT', true));
	await act(async () => first.reject(new Error('Unavailable')));
	expect(result.current.status).toBe('error');
	act(() => result.current.retry());
	expect(result.current.status).toBe('loading');
	unmount();
	expect(second.abort).toHaveBeenCalledTimes(1);
	await act(async () => second.resolve({ locations: [location] }));
	expect(result.current.locations).toEqual([]);
});

it('does not request employers when appointment features are disabled', () => {
	renderHook(() => useNavigationEmployers('COBALT', false));
	expect(getLocations).not.toHaveBeenCalled();
});
