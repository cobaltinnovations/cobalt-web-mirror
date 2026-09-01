import { httpSingleton } from '@/lib/singletons/http-singleton';
import { appointmentService } from './appointment-service';

it('cancels an appointment with an optional cancellation reason', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);
	const data = {
		cancellationReason: 'Patient is no longer available.',
	};

	appointmentService.cancelAppointment('appointment-1', data);

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/appointments/appointment-1/cancel',
		data,
	});

	orchestrateRequestSpy.mockRestore();
});

it('continues to support appointment cancellation without a reason', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	appointmentService.cancelAppointment('appointment-1');

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'put',
		url: '/appointments/appointment-1/cancel',
		data: {},
	});

	orchestrateRequestSpy.mockRestore();
});
