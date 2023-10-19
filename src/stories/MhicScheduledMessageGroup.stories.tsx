import { MhicScheduledMessageGroup } from '@/components/integrated-care/mhic';
import { MessageStatusId, MessageTypeId, ScheduledMessageStatusId } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicScheduledMessageGroup> = {
	title: 'MhicScheduledMessageGroup',
	component: MhicScheduledMessageGroup,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicScheduledMessageGroup>;

export const Default: Story = {
	render: (args) => {
		return <MhicScheduledMessageGroup {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		message: {
			patientOrderScheduledMessageGroupId: 'string;',
			patientOrderScheduledMessageTypeId: 'string;',
			patientOrderScheduledMessageTypeDescription: '{{patientOrderScheduledMessageTypeDescription}}',
			scheduledMessageSourceId: 'string;',
			patientOrderId: 'string;',
			scheduledAtDate: 'string;',
			scheduledAtDateDescription: 'string;',
			scheduledAtTime: 'string;',
			scheduledAtTimeDescription: 'string;',
			scheduledAtDateTime: 'string;',
			scheduledAtDateTimeDescription: '{{scheduledAtDateTimeDescription}}',
			timeZone: 'string;',
			created: 'string;',
			createdDescription: 'string;',
			lastUpdated: 'string;',
			lastUpdatedDescription: 'string;',

			patientOrderScheduledMessages: [
				{
					emailToAddresses: [],
					institutionId: 'string;',
					messageId: 'string;',
					messageStatusDescription: 'string;',
					messageStatusId: MessageStatusId.ENQUEUED,
					messageTypeDescription: '{{SMS}}',
					messageTypeId: MessageTypeId.SMS,
					patientOrderScheduledMessageId: 'string;',
					processedAt: 'string;',
					processedAtDescription: 'string;',
					scheduledMessageId: 'string;',
					scheduledMessageStatusId: ScheduledMessageStatusId.PENDING,
					sentAt: 'string;',
					sentAtDescription: 'string;',
					smsToNumber: 'string;',
					smsToNumberDescription: 'string;',
					scheduledAtDate: 'string;',
				},
			],
			scheduledAtDateTimeHasPassed: false,
		},
		onEditClick: () => {
			alert('Edit clicked');
		},
	},
};
