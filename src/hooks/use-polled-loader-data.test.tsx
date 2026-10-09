import React, { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';

import { ErrorModalContext } from '@/contexts/error-modal-context';
import { ReauthModalContext } from '@/contexts/reauth-modal-context';
import { CobaltError } from '@/lib/http-client';
import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';
import { usePolledLoaderData } from './use-polled-loader-data';

const mockSignOut = jest.fn();
const mockAddFlag = jest.fn();
const displayModalForError = jest.fn();
const setSignOnUrl = jest.fn();
const setShowReauthModal = jest.fn();

jest.mock('react-router-dom', () => ({
	useNavigation: () => ({ state: 'idle' }),
}));
jest.mock('./use-account', () => ({
	__esModule: true,
	default: () => ({ signOutAndClearContext: mockSignOut }),
}));
jest.mock('./use-flags', () => ({
	__esModule: true,
	default: () => ({ addFlag: mockAddFlag }),
}));
jest.mock('@/lib/services', () => ({
	analyticsService: { persistEvent: jest.fn() },
}));
jest.mock('@/lib/utils', () => ({
	didBookingExperienceChange: () => false,
}));

function wrapper({ children }: PropsWithChildren) {
	return (
		<ErrorModalContext.Provider
			value={{
				isErrorModalShown: false,
				dismissErrorModal: jest.fn(),
				displayModalForError,
				clearError: jest.fn(),
				error: undefined,
			}}
		>
			<ReauthModalContext.Provider
				value={{
					showReauthModal: false,
					setShowReauthModal,
					signOnUrl: '/sign-in',
					setSignOnUrl,
				}}
			>
				{children}
			</ReauthModalContext.Provider>
		</ErrorModalContext.Provider>
	);
}

function authError(accessTokenStatus: 'FULLY_EXPIRED' | 'PARTIALLY_EXPIRED' = 'FULLY_EXPIRED') {
	return CobaltError.fromApiError({
		code: 'AUTHENTICATION_REQUIRED',
		message: 'You must be authenticated to perform this action.',
		stackTrace: '',
		accessTokenStatus,
		signOnUrl: '/sign-in/mychart',
	});
}

function loaderData(responsePromise = Promise.resolve('initial')) {
	return {
		getResponseChecksum: () => responsePromise.then((response) => response),
		responsePromise,
		// Staff loaders also return promises derived from the same request.
		listPromise: responsePromise.then((response) => [response]),
	};
}

function setup(pollingFn: () => ReturnType<typeof loaderData>, enabled = true) {
	const initialData = loaderData();
	return renderHook(
		() =>
			usePolledLoaderData({
				useLoaderHook: () => initialData,
				pollingFn,
				intervalSeconds: 1,
				immediateUpdate: true,
				enabled,
			}),
		{ wrapper }
	);
}

async function tick(milliseconds = 1000) {
	await act(async () => {
		jest.advanceTimersByTime(milliseconds);
	});
}

beforeEach(() => {
	jest.useFakeTimers();
	jest.clearAllMocks();
});

afterEach(() => {
	jest.clearAllTimers();
	jest.useRealTimers();
});

it('signs out a stale tab after a polling 401 and stops further requests', async () => {
	const pollingFn = jest.fn(() => loaderData(Promise.reject(authError())));
	const { result } = setup(pollingFn);

	await tick();

	expect(mockSignOut).toHaveBeenCalledWith(AnalyticsNativeEventAccountSignedOutSource.ACCESS_TOKEN_EXPIRED, {});
	expect(displayModalForError).not.toHaveBeenCalled();
	expect(setShowReauthModal).not.toHaveBeenCalled();
	expect(result.current.isPolling).toBe(false);
	expect(result.current.data).toBe(result.current.loaderData);

	await tick(5000);
	expect(pollingFn).toHaveBeenCalledTimes(1);
	expect(mockSignOut).toHaveBeenCalledTimes(1);
});

it('opens the existing reauthentication modal for partial expiration and stops polling', async () => {
	const pollingFn = jest.fn(() => loaderData(Promise.reject(authError('PARTIALLY_EXPIRED'))));
	setup(pollingFn);

	await tick();

	expect(setSignOnUrl).toHaveBeenCalledWith('/sign-in/mychart');
	expect(setShowReauthModal).toHaveBeenCalledWith(true);
	expect(mockSignOut).not.toHaveBeenCalled();
	expect(displayModalForError).not.toHaveBeenCalled();

	await tick(5000);
	expect(pollingFn).toHaveBeenCalledTimes(1);
});

it('handles a synchronous authentication failure from the polling loader', async () => {
	const pollingFn = jest.fn(() => {
		throw authError();
	});
	const { result } = setup(pollingFn);

	await tick();
	await tick(5000);

	expect(mockSignOut).toHaveBeenCalledTimes(1);
	expect(pollingFn).toHaveBeenCalledTimes(1);
	expect(result.current.isPolling).toBe(false);
});

it('keeps the last good data after a transient failure and accepts the next successful poll', async () => {
	const error = CobaltError.fromUnknownError(new Error('Server unavailable'));
	const pollingFn = jest
		.fn()
		.mockImplementationOnce(() => loaderData(Promise.reject(error)))
		.mockImplementationOnce(() => loaderData(Promise.resolve('updated')));
	const { result } = setup(pollingFn);

	await tick();
	expect(displayModalForError).toHaveBeenCalledWith(error);
	expect(mockSignOut).not.toHaveBeenCalled();
	expect(result.current.data).toBe(result.current.loaderData);
	expect(result.current.isPolling).toBe(false);

	await tick();
	expect(pollingFn).toHaveBeenCalledTimes(2);
	await expect(result.current.data.responsePromise).resolves.toBe('updated');
	await expect(result.current.data.listPromise).resolves.toEqual(['updated']);
});

it('does not overlap polling requests while a response is pending', async () => {
	let resolveResponse!: (response: string) => void;
	const pendingResponse = new Promise<string>((resolve) => {
		resolveResponse = resolve;
	});
	const pollingFn = jest.fn(() => loaderData(pendingResponse));
	const { result } = setup(pollingFn);

	await tick();
	expect(result.current.isPolling).toBe(true);
	await tick(5000);
	expect(pollingFn).toHaveBeenCalledTimes(1);

	await act(async () => resolveResponse('updated'));
	expect(result.current.isPolling).toBe(false);
	await expect(result.current.data.responsePromise).resolves.toBe('updated');
});

it('ignores a polling failure after the page has unmounted', async () => {
	let rejectResponse!: (error: CobaltError) => void;
	const pendingResponse = new Promise<string>((_, reject) => {
		rejectResponse = reject;
	});
	const pollingFn = jest.fn(() => loaderData(pendingResponse));
	const { unmount } = setup(pollingFn);

	await tick();
	unmount();
	await act(async () => rejectResponse(authError()));

	expect(mockSignOut).not.toHaveBeenCalled();
	expect(displayModalForError).not.toHaveBeenCalled();
	await tick(5000);
	expect(pollingFn).toHaveBeenCalledTimes(1);
});

it('leaves initial-load errors to the route without an unhandled checksum rejection', async () => {
	const failedData = loaderData(Promise.reject(CobaltError.fromUnknownError(new Error('Initial load failed'))));
	const pollingFn = jest.fn();

	renderHook(
		() =>
			usePolledLoaderData({
				useLoaderHook: () => failedData,
				pollingFn,
				enabled: false,
			}),
		{ wrapper }
	);
	await tick();

	expect(displayModalForError).not.toHaveBeenCalled();
	expect(mockSignOut).not.toHaveBeenCalled();
	expect(pollingFn).not.toHaveBeenCalled();
});
