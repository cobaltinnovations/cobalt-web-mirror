import {
	ATTENDANCE_STATUS_ID,
	CareEncounterAssignmentScopeId,
	CareEncounterCancellationReasonId,
	CareEncounterScheduledMessageTypeId,
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

it('requests care encounter scheduled message types', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.getCareEncounterScheduledMessageTypes();

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'get',
		url: '/admin/care-encounter-scheduled-message-types',
	});

	orchestrateRequestSpy.mockRestore();
});

it('previews a care encounter scheduled message', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId.FOLLOW_UP,
		customEmailText: '<p>Resources</p>',
	};

	careEncounterService.previewCareEncounterScheduledMessage('care-encounter-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'post',
		url: '/admin/care-encounters/care-encounter-1/scheduled-messages/preview',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('creates a care encounter scheduled message', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId.FOLLOW_UP,
		scheduledAtDate: '2026-08-26',
		scheduledAtTime: '10:30:00',
		customEmailText: '<p>Resources</p>',
	};

	careEncounterService.createCareEncounterScheduledMessage('care-encounter-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'post',
		url: '/admin/care-encounters/care-encounter-1/scheduled-messages',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('updates a care encounter scheduled message', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId.FOLLOW_UP,
		scheduledAtDate: '2026-08-27',
		scheduledAtTime: '11:45:00',
		customEmailText: '<p>Updated resources</p>',
	};

	careEncounterService.updateCareEncounterScheduledMessage(
		'care-encounter-1',
		'care-encounter-scheduled-message-1',
		data
	);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1/scheduled-messages/care-encounter-scheduled-message-1',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('deletes a care encounter scheduled message', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.deleteCareEncounterScheduledMessage('care-encounter-1', 'care-encounter-scheduled-message-1');

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'delete',
		url: '/admin/care-encounters/care-encounter-1/scheduled-messages/care-encounter-scheduled-message-1',
	});

	orchestrateRequestSpy.mockRestore();
});

it('creates an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		appointmentId: 'appointment-1',
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
	};

	careEncounterService.updateCareEncounter('care-encounter-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('requests notes for an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.getCareEncounterNotes('care-encounter-1');

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'get',
		url: '/admin/care-encounters/care-encounter-1/notes',
	});

	orchestrateRequestSpy.mockRestore();
});

it('creates a note for an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = { note: 'New encounter note' };

	careEncounterService.createCareEncounterNote('care-encounter-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'post',
		url: '/admin/care-encounters/care-encounter-1/notes',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('updates a note for an admin care encounter', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = { note: 'Updated encounter note' };

	careEncounterService.updateCareEncounterNote('care-encounter-1', 'care-encounter-note-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1/notes/care-encounter-note-1',
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

it('requests selectable care encounter attendance statuses', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	careEncounterService.getCareEncounterAttendanceStatuses();

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'get',
		url: '/admin/care-encounter-attendance-statuses',
	});

	orchestrateRequestSpy.mockRestore();
});

it('changes a care encounter appointment attendance status', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		attendanceStatusId: ATTENDANCE_STATUS_ID.ATTENDED,
	};

	careEncounterService.changeCareEncounterAppointmentAttendanceStatus('care-encounter-1', 'appointment-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/admin/care-encounters/care-encounter-1/appointments/appointment-1/attendance-status',
		data,
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
