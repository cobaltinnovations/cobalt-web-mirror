import { httpSingleton } from '@/lib/singletons/http-singleton';
import { reportingSerive, ReportTypeId } from './reporting-service';

it('requests a date-ranged report as an authenticated blob', () => {
	const orchestrateRequestSpy = jest.spyOn(httpSingleton, 'orchestrateRequest').mockReturnValue({} as never);

	reportingSerive.runReport({
		reportTypeId: ReportTypeId.ACCOUNT_GEOLOCATION,
		reportFormatId: 'CSV',
		startDateTime: '2026-09-01T00:00:00',
		endDateTime: '2026-09-10T23:59:59.999999',
	});

	expect(orchestrateRequestSpy).toHaveBeenCalledWith({
		method: 'GET',
		responseType: 'blob',
		url: '/reporting/run-report?reportTypeId=ACCOUNT_GEOLOCATION&reportFormatId=CSV&startDateTime=2026-09-01T00%3A00%3A00&endDateTime=2026-09-10T23%3A59%3A59.999999',
	});

	orchestrateRequestSpy.mockRestore();
});
