import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';
import appointmentTypesJSON from '@/fixtures/appointment-types.json';
import providerWithAvailabilityJSON from '@/fixtures/provider-with-availability.json';
import ConfirmAppointmentTypeModal from '@/components/confirm-appointment-type-modal';

const meta: Meta<typeof ConfirmAppointmentTypeModal> = {
	title: 'ConfirmAppointmentTypeModal',
	component: ConfirmAppointmentTypeModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ConfirmAppointmentTypeModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<ConfirmAppointmentTypeModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		appointmentTypes: appointmentTypesJSON.map((type, idx) => {
			return {
				...type,
				disabled: idx > 0,
			};
		}),
		providerName: 'Provider Name',
		onConfirm: () => {
			alert('confirmed');
		},
		timeSlot: providerWithAvailabilityJSON.times[3],
		epicDepartment: {
			departmentId: 'id123',
			departmentIdType: 'id-type',
			epicDepartmentId: 'dept-id',
			name: 'Epic Department Name',
		},
	},
};
