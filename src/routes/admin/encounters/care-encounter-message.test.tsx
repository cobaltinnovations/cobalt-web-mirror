import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { CobaltThemeProvider } from '@/jss/theme';
import {
	CareEncounterModel,
	CareEncounterScheduledMessageModel,
	CareEncounterScheduledMessageTypeId,
	CareEncounterStatusId,
	MessageStatusId,
	MessageTypeId,
	ScheduledMessageStatusId,
} from '@/lib/models';
import { careEncounterService } from '@/lib/services';
import { CareEncounterMessageModal } from './care-encounter-message-modal';
import { EncounterContactHistory } from './encounter-contact-history';

const mockAddFlag = jest.fn();
const mockHandleError = jest.fn();

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/wysiwyg-basic', () => {
	const React = require('react');

	return {
		__esModule: true,
		default: React.forwardRef(
			(
				{
					value,
					onChange,
				}: {
					value: string;
					onChange(value: string, delta: unknown, source: unknown, editor: unknown): void;
				},
				_ref: unknown
			) => (
				<textarea
					aria-label="Custom email text"
					value={value}
					onChange={(event) => onChange(event.currentTarget.value, {}, 'user', {})}
				/>
			)
		),
		WysiwygDisplay: ({ html }: { html: string }) => <div dangerouslySetInnerHTML={{ __html: html }} />,
		wysiwygIsValid: () => true,
	};
});

jest.mock('@/hooks/use-handle-error', () => ({
	__esModule: true,
	default: () => mockHandleError,
}));

jest.mock('@/hooks/use-flags', () => ({
	__esModule: true,
	default: () => ({ addFlag: mockAddFlag }),
}));

const messageTypesResponse = {
	careEncounterScheduledMessageTypes: [
		{
			careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId.FOLLOW_UP,
			description: 'Follow-up',
			displayOrder: 1,
			supportedMessageTypeIds: [MessageTypeId.EMAIL],
		},
	],
};

const pendingMessage = {
	careEncounterScheduledMessageId: 'scheduled-message-1',
	careEncounterId: 'care-encounter-1',
	careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId.FOLLOW_UP,
	careEncounterScheduledMessageTypeDescription: 'Follow-up',
	scheduledMessageId: 'scheduler-1',
	scheduledMessageStatusId: ScheduledMessageStatusId.PENDING,
	scheduledMessageStatusDescription: 'Pending',
	scheduledMessageSourceId: 'MANUAL',
	scheduledByAccountId: 'navigator-1',
	scheduledByAccountDisplayName: 'Navigator Name',
	messageId: 'message-1',
	scheduledAtDate: '2026-08-26',
	scheduledAtTime: '10:30:00',
	timeZone: 'America/New_York',
	scheduledAt: '2026-08-26T14:30:00Z',
	scheduledAtDescription: 'Aug 26, 2026 at 10:30 AM',
	recipientEmailAddress: 'patient@example.com',
	customEmailText: '<p>Original resources.</p>',
	emailSubject: 'Follow-up from Cobalt',
	emailContentHtml: '<p>Hello Avery,</p><p>Original resources.</p>',
	emailBody: '<html><body><p>Hello Avery,</p><p>Original resources.</p></body></html>',
	editable: true,
	cancelable: true,
	deleted: false,
	createdByAccountId: 'navigator-1',
	createdByAccountDisplayName: 'Navigator Name',
	lastUpdatedByAccountId: 'navigator-1',
	lastUpdatedByAccountDisplayName: 'Navigator Name',
	created: '2026-08-24T16:00:00Z',
	createdDescription: 'Aug 24, 2026 at 12:00 PM',
	lastUpdated: '2026-08-24T16:00:00Z',
	lastUpdatedDescription: 'Aug 24, 2026 at 12:00 PM',
} as CareEncounterScheduledMessageModel;

const sentMessage = {
	...pendingMessage,
	careEncounterScheduledMessageId: 'scheduled-message-2',
	scheduledMessageStatusId: ScheduledMessageStatusId.PROCESSED,
	scheduledMessageStatusDescription: 'Processed',
	messageStatusId: MessageStatusId.SENT,
	messageStatusDescription: 'Sent',
	sentAt: '2026-08-26T14:31:00Z',
	sentAtDescription: 'Aug 26, 2026 at 10:31 AM',
	editable: false,
	cancelable: false,
} as CareEncounterScheduledMessageModel;

const careEncounter = {
	careEncounterId: 'care-encounter-1',
	careEncounterStatusId: CareEncounterStatusId.OPEN,
	careEncounterScheduledMessages: [],
} as CareEncounterModel;

const renderWithTheme = (children: React.ReactNode) => {
	return render(<CobaltThemeProvider>{children}</CobaltThemeProvider>);
};

const getMessageTypesSpy = jest.spyOn(careEncounterService, 'getCareEncounterScheduledMessageTypes');
const previewMessageSpy = jest.spyOn(careEncounterService, 'previewCareEncounterScheduledMessage');
const createMessageSpy = jest.spyOn(careEncounterService, 'createCareEncounterScheduledMessage');
const updateMessageSpy = jest.spyOn(careEncounterService, 'updateCareEncounterScheduledMessage');
const deleteMessageSpy = jest.spyOn(careEncounterService, 'deleteCareEncounterScheduledMessage');

beforeEach(() => {
	getMessageTypesSpy.mockReturnValue({
		fetch: jest.fn().mockResolvedValue(messageTypesResponse),
	} as ReturnType<typeof careEncounterService.getCareEncounterScheduledMessageTypes>);
	previewMessageSpy.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({
			careEncounterScheduledMessagePreview: {
				emailSubject: 'Follow-up from Cobalt',
				emailContentHtml: '<p>Previewed follow-up copy</p>',
				emailBody: '<html><body><p>Previewed follow-up copy</p></body></html>',
			},
		}),
	} as ReturnType<typeof careEncounterService.previewCareEncounterScheduledMessage>);
	createMessageSpy.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ careEncounterScheduledMessage: pendingMessage }),
	} as ReturnType<typeof careEncounterService.createCareEncounterScheduledMessage>);
	updateMessageSpy.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ careEncounterScheduledMessage: pendingMessage }),
	} as ReturnType<typeof careEncounterService.updateCareEncounterScheduledMessage>);
	deleteMessageSpy.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({
			careEncounterScheduledMessage: { ...pendingMessage, deleted: true },
		}),
	} as ReturnType<typeof careEncounterService.deleteCareEncounterScheduledMessage>);
});

afterEach(() => {
	jest.clearAllMocks();
});

it('uses one form state across the create and preview pages and schedules the message', async () => {
	const onChanged = jest.fn();
	const onHide = jest.fn();

	renderWithTheme(
		<CareEncounterMessageModal show careEncounterId="care-encounter-1" onHide={onHide} onChanged={onChanged} />
	);

	expect(await screen.findByText('Schedule Message', { selector: '.cobalt-modal__title' })).toBeInTheDocument();
	await waitFor(() => expect(screen.getByDisplayValue('Follow-up')).toHaveValue('FOLLOW_UP'));
	fireEvent.change(screen.getByRole('textbox', { name: 'Custom email text' }), {
		target: { value: '<p>My resources</p>' },
	});
	fireEvent.click(screen.getByRole('button', { name: 'Next: Preview' }));

	expect(await screen.findByText('Preview Email', { selector: '.cobalt-modal__title' })).toBeInTheDocument();
	expect(screen.getByText('Previewed follow-up copy')).toBeInTheDocument();
	expect(previewMessageSpy).toHaveBeenCalledWith('care-encounter-1', {
		careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId.FOLLOW_UP,
		customEmailText: '<p>My resources</p>',
	});

	fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
	expect(await screen.findByText('Schedule Message', { selector: '.cobalt-modal__title' })).toBeInTheDocument();
	expect(screen.getByRole('textbox', { name: 'Custom email text' })).toHaveValue('<p>My resources</p>');
	fireEvent.click(screen.getByRole('button', { name: 'Next: Preview' }));
	fireEvent.click(await screen.findByRole('button', { name: 'Schedule Message' }));

	await waitFor(() => {
		expect(createMessageSpy).toHaveBeenCalledTimes(1);
		expect(onHide).toHaveBeenCalled();
		expect(onChanged).toHaveBeenCalled();
	});
	expect(createMessageSpy).toHaveBeenCalledWith(
		'care-encounter-1',
		expect.objectContaining({
			careEncounterScheduledMessageTypeId: CareEncounterScheduledMessageTypeId.FOLLOW_UP,
			customEmailText: '<p>My resources</p>',
		})
	);
	expect(mockAddFlag).toHaveBeenCalledWith({
		variant: 'success',
		title: 'Message Scheduled',
		description: 'Message is scheduled for Aug 26, 2026 at 10:30 AM.',
		actions: [],
	});
});

it('rejects a past local time before requesting a preview', async () => {
	renderWithTheme(
		<CareEncounterMessageModal show careEncounterId="care-encounter-1" onHide={jest.fn()} onChanged={jest.fn()} />
	);

	await screen.findByText('Schedule Message', { selector: '.cobalt-modal__title' });
	await waitFor(() => expect(screen.getByDisplayValue('Follow-up')).toHaveValue('FOLLOW_UP'));
	fireEvent.change(screen.getByRole('textbox', { name: 'Custom email text' }), {
		target: { value: '<p>My resources</p>' },
	});
	fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '12:00 AM' } });
	fireEvent.click(screen.getByRole('button', { name: 'Next: Preview' }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Scheduled time cannot be in the past.');
	expect(previewMessageSpy).not.toHaveBeenCalled();
});

it('edits directly from the form and confirms deletion', async () => {
	const onChanged = jest.fn();

	renderWithTheme(
		<CareEncounterMessageModal
			show
			careEncounterId="care-encounter-1"
			messageToEdit={pendingMessage}
			onHide={jest.fn()}
			onChanged={onChanged}
		/>
	);

	expect(await screen.findByText('Edit Schedule Message', { selector: '.cobalt-modal__title' })).toBeInTheDocument();
	expect(screen.getByLabelText('Email')).toBeChecked();
	fireEvent.change(screen.getByRole('textbox', { name: 'Custom email text' }), {
		target: { value: '<p>Updated resources</p>' },
	});
	const saveForm = screen.getByRole('button', { name: 'Save' }).closest('form');
	if (!saveForm) {
		throw new Error('Edit Schedule Message form not found.');
	}
	fireEvent.submit(saveForm);

	await waitFor(() => {
		expect(updateMessageSpy).toHaveBeenCalledTimes(1);
		expect(mockAddFlag).toHaveBeenCalledWith(expect.objectContaining({ title: 'Message Updated' }));
	});
	expect(previewMessageSpy).not.toHaveBeenCalled();

	await act(async () => {
		fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
	});
	const confirmationTitle = await screen.findByText('Delete Scheduled Message', {
		selector: '.cobalt-modal__title',
	});
	const confirmation = confirmationTitle.closest('[role="dialog"]');
	if (!confirmation) {
		throw new Error('Delete Scheduled Message dialog not found.');
	}
	fireEvent.click(within(confirmation).getByRole('button', { name: 'Delete' }));

	await waitFor(() => {
		expect(deleteMessageSpy).toHaveBeenCalledWith('care-encounter-1', 'scheduled-message-1');
		expect(mockAddFlag).toHaveBeenCalledWith({ variant: 'success', title: 'Message Deleted', actions: [] });
	});
});

it('renders pending and sent designs, hides deleted records, and prevents duplicate scheduling', () => {
	renderWithTheme(
		<EncounterContactHistory
			careEncounter={{
				...careEncounter,
				careEncounterScheduledMessages: [
					pendingMessage,
					sentMessage,
					{ ...sentMessage, careEncounterScheduledMessageId: 'deleted-message', deleted: true },
				],
			}}
			onChanged={jest.fn()}
		/>
	);

	expect(screen.getByText('Message scheduled for Aug 26, 2026 at 10:30 AM')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Edit scheduled message' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Schedule Message' })).toBeDisabled();
	expect(screen.getByText('Navigator Name', { selector: 'strong' })).toBeInTheDocument();
	expect(screen.getByText(/sent a follow-up email/)).toBeInTheDocument();
	expect(screen.getAllByText('Hello Avery,')).toHaveLength(1);
	expect(screen.queryByText('...')).not.toBeInTheDocument();
});

it('shows a terminal unsent status instead of claiming the message was sent', () => {
	const failedMessage = {
		...sentMessage,
		careEncounterScheduledMessageId: 'failed-message',
		sentAt: undefined,
		sentAtDescription: undefined,
		messageStatusId: MessageStatusId.DELIVERY_FAILED,
		messageStatusDescription: 'Delivery Failed',
	} as CareEncounterScheduledMessageModel;

	renderWithTheme(
		<EncounterContactHistory
			careEncounter={{ ...careEncounter, careEncounterScheduledMessages: [failedMessage] }}
			onChanged={jest.fn()}
		/>
	);

	expect(screen.getByText('Status: Delivery Failed')).toBeInTheDocument();
	expect(screen.queryByText(/sent a follow-up email/)).not.toBeInTheDocument();
});

it('keeps the schedule action visible but disabled on a closed encounter', () => {
	renderWithTheme(
		<EncounterContactHistory
			careEncounter={{
				...careEncounter,
				careEncounterStatusId: CareEncounterStatusId.CLOSED,
				careEncounterScheduledMessages: [],
			}}
			onChanged={jest.fn()}
		/>
	);

	expect(screen.getByRole('button', { name: 'Schedule Message' })).toBeDisabled();
	expect(screen.getByRole('heading', { name: 'No Contact Attempts Logged' })).toBeInTheDocument();
});
