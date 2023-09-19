import CalendarAppointment from '@/components/calendar-appointment';
import appointmentJSON from '@/fixtures/appointment.json';
import groupSessionJSON from '@/fixtures/group-session.json';
import { AppointmentModel, GroupSessionModel } from '@/lib/models';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Container } from 'react-bootstrap';
import { PlaceholderImageRenderer } from './helpers/placeholder-image-renderer';

const meta: Meta<typeof CalendarAppointment> = {
	title: 'CalendarAppointment',
	component: CalendarAppointment,
	tags: ['autodocs'],
	argTypes: {},
	render: (args) => {
		return (
			<Container>
				<PlaceholderImageRenderer>{(imageUrl) => <CalendarAppointment {...args} />}</PlaceholderImageRenderer>
			</Container>
		);
	},
};

export default meta;

type Story = StoryObj<typeof CalendarAppointment>;

export const Appointment: Story = {
	args: {
		className: '',
		appointment: appointmentJSON as AppointmentModel,
		onCancel: () => {
			alert('Cancelled');
		},
	},
};

export const GroupSession: Story = {
	args: {
		className: '',
		groupSession: groupSessionJSON as GroupSessionModel,
		onCancel: () => {
			alert('Cancelled');
		},
	},
};
