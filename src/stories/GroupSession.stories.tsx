import GroupSession from '@/components/group-session';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import groupSessionJSON from '@/fixtures/group-session.json';
import groupSessionReservationJSON from '@/fixtures/group-session-reservation.json';
import { GroupSessionLearnMoreMethodId, GroupSessionModel } from '@/lib/models';
import moment from 'moment';
import { GroupSessionSchedulingSystemId } from '@/lib/services';

const meta: Meta<typeof GroupSession> = {
	title: 'GroupSession',
	component: GroupSession,
	tags: ['autodocs'],
	parameters: {
		actions: {
			handles: ['click'],
		},
	},
	argTypes: {
		groupSession: {
			control: { type: 'object' },
		},
		groupSessionReservation: {
			control: { type: 'object' },
		},
		onReserveSeat: {
			action: 'click',
		},
		onCancelReservation: {
			action: 'click',
		},
	},
};

export default meta;

type Story = StoryObj<typeof GroupSession>;

export const Available: Story = {
	render: (args) => {
		return <GroupSession {...args} />;
	},
	args: {
		groupSession: {
			...(groupSessionJSON as GroupSessionModel),
			startDateTime: moment().add(1, 'days').toISOString(),
			endDateTime: moment().add(7, 'days').toISOString(),
		},
		onReserveSeat: () => {
			alert('Reserve Seat');
		},
	},
};

export const AvailableExternal: Story = {
	render: (args) => {
		return <GroupSession {...args} />;
	},
	args: {
		groupSession: {
			...(groupSessionJSON as GroupSessionModel),
			groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId.EXTERNAL,
			groupSessionLearnMoreMethodId: GroupSessionLearnMoreMethodId.PHONE,
			startDateTime: moment().add(1, 'days').toISOString(),
			endDateTime: moment().add(7, 'days').toISOString(),
		},
		onReserveSeat: () => {
			alert('Learn More');
		},
	},
};

export const ReservedSeat: Story = {
	render: (args) => {
		return <GroupSession {...args} />;
	},
	args: {
		groupSession: {
			...(groupSessionJSON as GroupSessionModel),
			startDateTime: moment().add(1, 'days').toISOString(),
			endDateTime: moment().add(7, 'days').toISOString(),
		},
		groupSessionReservation: groupSessionReservationJSON,
		onCancelReservation: () => {
			alert('Cancel Clicked');
		},
	},
};

export const PastEndDate: Story = {
	render: (args) => {
		return <GroupSession {...args} />;
	},
	args: {
		groupSession: {
			...(groupSessionJSON as GroupSessionModel),
			startDateTime: moment().subtract(2, 'days').toISOString(),
			endDateTime: moment().subtract(1, 'days').toISOString(),
		},
	},
};
