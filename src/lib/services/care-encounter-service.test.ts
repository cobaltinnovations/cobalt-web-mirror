import {
	CareEncounterAssignmentScopeId,
	CareEncounterCancellationReasonId,
	CareEncounterSortColumnId,
	CareEncounterStatusId,
	SortDirectionId,
} from '@/lib/models';
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
		careEncounterAssignmentScopeId: CareEncounterAssignmentScopeId.SELF,
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
		careEncounterAssignmentScopeId: 'SELF',
		careEncounterSortColumnId: 'CREATED',
		sortDirectionId: 'ASCENDING',
	});

	orchestrateRequestSpy.mockRestore();
});

it('requests an admin care encounter by ID', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.getCareEncounter('care-encounter-1');

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'get',
		url: '/admin/care-encounters/care-encounter-1',
	});

	orchestrateRequestSpy.mockRestore();
});

it('creates an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		appointmentId: 'appointment-1',
		notes: 'Initial notes',
	};

	careEncounterService.createCareEncounter(data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'post',
		url: '/admin/care-encounters',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('updates an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		emailAddress: 'patient@example.com',
		notes: 'Updated notes',
	};

	careEncounterService.updateCareEncounter('care-encounter-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('closes an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.closeCareEncounter('care-encounter-1');

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1/close',
	});

	orchestrateRequestSpy.mockRestore();
});

it('assigns an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		careNavigatorAccountId: 'care-navigator-1',
	};

	careEncounterService.assignCareEncounter('care-encounter-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1/assignment',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('requests care encounter cancellation reasons', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.getCareEncounterCancellationReasons();

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'get',
		url: '/admin/care-encounter-cancellation-reasons',
	});

	orchestrateRequestSpy.mockRestore();
});

it('cancels an admin care encounter with its cancellation reason', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		careEncounterCancellationReasonId: CareEncounterCancellationReasonId.OTHER,
		careEncounterCancellationReasonOtherText: 'A different reason',
	};

	careEncounterService.cancelCareEncounter('care-encounter-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1/cancel',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('cancels a care encounter appointment with its cancellation reason', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		cancellationReason: 'Patient is no longer available.',
	};

	careEncounterService.cancelCareEncounterAppointment('care-encounter-1', 'appointment-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1/appointments/appointment-1/cancel',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('deletes an admin care encounter without expecting a response body', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.deleteCareEncounter('care-encounter-1');

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'delete',
		url: '/admin/care-encounters/care-encounter-1',
	});

	orchestrateRequestSpy.mockRestore();
});
