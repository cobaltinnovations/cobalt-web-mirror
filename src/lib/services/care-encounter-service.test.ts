import { CareEncounterSortColumnId, CareEncounterStatusId, SortDirectionId } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { careEncounterService } from './care-encounter-service';

it('requests admin care encounters with every supported listing parameter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.getCareEncounters({
		pageNumber: 2,
		pageSize: 25,
		startDate: '2026-08-01',
		endDate: '2026-08-31',
		searchQuery: 'Avery Morgan',
		careEncounterStatusId: CareEncounterStatusId.CLOSED,
		careEncounterSortColumnId: CareEncounterSortColumnId.CREATED,
		sortDirectionId: SortDirectionId.ASCENDING,
	});

	expect(orchestrateRequestSpy).toHaveBeenCalledTimes(1);
	const requestConfig = orchestrateRequestSpy.mock.calls[0][0];
	const requestUrl = new URL(requestConfig.url ?? '', 'https://example.com');

	expect(requestConfig.method).toBe('get');
	expect(requestUrl.pathname).toBe('/admin/care-encounters');
	expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
		pageNumber: '2',
		pageSize: '25',
		startDate: '2026-08-01',
		endDate: '2026-08-31',
		searchQuery: 'Avery Morgan',
		careEncounterStatusId: 'CLOSED',
		careEncounterSortColumnId: 'CREATED',
		sortDirectionId: 'ASCENDING',
	});

	orchestrateRequestSpy.mockRestore();
});
