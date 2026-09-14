import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import useAccount from '@/hooks/use-account';
import { reportingSerive, ReportTypeId } from '@/lib/services';
import Reports from './reports';

const mockHandleError = jest.fn();

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => mockHandleError,
}));
jest.mock('@/components/async-page', () => {
	const React = require('react');

	return {
		__esModule: true,
		default: ({ children, fetchData }: { children: React.ReactNode; fetchData(): Promise<unknown> }) => {
			const [loaded, setLoaded] = React.useState(false);

			React.useEffect(() => {
				let mounted = true;
				Promise.resolve(fetchData()).then(() => mounted && setLoaded(true));

				return () => {
					mounted = false;
				};
			}, [fetchData]);

			return loaded ? children : null;
		},
	};
});
jest.mock('@/components/date-picker', () => {
	const React = require('react');

	return {
		__esModule: true,
		default: ({ labelText, onChange }: { labelText: string; onChange(date: Date): void }) => (
			<input
				type="date"
				aria-label={labelText}
				onChange={({ currentTarget }) => onChange(new Date(`${currentTarget.value}T12:00:00`))}
			/>
		),
	};
});
jest.mock('@/components/input-helper', () => {
	const React = require('react');

	return {
		__esModule: true,
		default: ({ as, label, children, ...props }: any) => {
			delete props.helperText;
			delete props.error;

			return (
				<label>
					{label}
					{as === 'select' ? (
						<select aria-label={label} {...props}>
							{children}
						</select>
					) : (
						<input aria-label={label} {...props} />
					)}
				</label>
			);
		},
	};
});
jest.mock('@/components/loading-button', () => {
	const React = require('react');

	return {
		__esModule: true,
		default: ({ isLoading, children, ...props }: any) => (
			<button {...props}>{isLoading ? 'Downloading Report' : children}</button>
		),
	};
});

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

function mockAccount(canViewAnalytics: boolean) {
	mockUseAccount.mockReturnValue({
		account: {
			accountCapabilityFlags: {
				canViewAnalytics,
				canViewProviderReportAppointmentCancelations: false,
				canViewProviderReportAppointmentsEap: false,
				canViewProviderReportUnusedAvailability: false,
			},
		},
		institution: {},
		signOutAndClearContext: jest.fn(),
	} as ReturnType<typeof useAccount>);
}

function mockReportTypes(reportTypes: Array<{ reportTypeId: string; description: string }>) {
	return jest.spyOn(reportingSerive, 'getReportTypes').mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ reportTypes }),
	} as never);
}

afterEach(() => {
	jest.restoreAllMocks();
	mockHandleError.mockReset();
});

it('shows Account Geolocation when the reporting API returns it, without inferring local capability access', async () => {
	mockAccount(false);
	mockReportTypes([
		{
			reportTypeId: ReportTypeId.ACCOUNT_GEOLOCATION,
			description: 'Analytics - Account Geolocation',
		},
	]);

	render(<Reports />);

	expect(await screen.findByRole('option', { name: 'Analytics - Account Geolocation' })).toBeInTheDocument();
});

it('does not show Account Geolocation when the reporting API omits it', async () => {
	mockAccount(true);
	mockReportTypes([{ reportTypeId: 'PROVIDER_APPOINTMENTS', description: 'Provider Appointments' }]);

	render(<Reports />);

	expect(await screen.findByRole('option', { name: 'Provider Appointments' })).toBeInTheDocument();
	expect(screen.queryByRole('option', { name: 'Analytics - Account Geolocation' })).not.toBeInTheDocument();
});

it('downloads Account Geolocation with local date-times and the server-provided CSV filename', async () => {
	mockAccount(false);
	mockReportTypes([
		{
			reportTypeId: ReportTypeId.ACCOUNT_GEOLOCATION,
			description: 'Analytics - Account Geolocation',
		},
	]);

	const blob = new Blob(['account_id\n'], { type: 'text/csv' });
	let resolveDownload: ((blob: Blob) => void) | undefined;
	const fetch = jest.fn(
		() =>
			new Promise<Blob>((resolve) => {
				resolveDownload = resolve;
			})
	);
	const runReport = jest.spyOn(reportingSerive, 'runReport').mockReturnValue({
		fetch,
		responseHeaders: {
			'content-disposition': 'attachment; filename="Cobalt ACCOUNT_GEOLOCATION 2026-09-01 to 2026-09-10.csv"',
		},
	} as never);
	const createObjectUrl = jest.fn(() => 'blob:report');
	const revokeObjectUrl = jest.fn();
	const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
	const appendChild = jest.spyOn(document.body, 'appendChild');

	Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
	Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });

	render(<Reports />);
	await screen.findByRole('option', { name: 'Analytics - Account Geolocation' });

	fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-09-01' } });
	fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-09-10' } });
	fireEvent.click(screen.getByRole('button', { name: 'Download Report' }));

	expect(runReport).toHaveBeenCalledWith({
		reportTypeId: ReportTypeId.ACCOUNT_GEOLOCATION,
		reportFormatId: 'CSV',
		startDateTime: '2026-09-01T00:00:00',
		endDateTime: '2026-09-10T23:59:59.999999',
	});
	expect(screen.getByRole('button', { name: 'Downloading Report' })).toBeDisabled();

	resolveDownload?.(blob);

	await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
	const appendedLink = appendChild.mock.calls.find(([node]) => node instanceof HTMLAnchorElement)?.[0] as
		| HTMLAnchorElement
		| undefined;
	expect(appendedLink?.download).toBe('Cobalt ACCOUNT_GEOLOCATION 2026-09-01 to 2026-09-10.csv');
	expect(createObjectUrl).toHaveBeenCalledWith(blob);
	expect(revokeObjectUrl).toHaveBeenCalledWith('blob:report');
});

it('blocks an inverted date range before requesting the report', async () => {
	mockAccount(false);
	mockReportTypes([
		{
			reportTypeId: ReportTypeId.ACCOUNT_GEOLOCATION,
			description: 'Analytics - Account Geolocation',
		},
	]);
	const runReport = jest.spyOn(reportingSerive, 'runReport');

	render(<Reports />);
	await screen.findByRole('option', { name: 'Analytics - Account Geolocation' });

	fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-09-10' } });
	fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-09-01' } });

	expect(screen.getByRole('alert')).toHaveTextContent('Start Date must be on or before End Date.');
	expect(screen.getByRole('button', { name: 'Download Report' })).toBeDisabled();
	expect(runReport).not.toHaveBeenCalled();
});
