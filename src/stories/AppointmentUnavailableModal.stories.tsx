import AppointmentUnavailableModal from '@/components/appointment-unavailable-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof AppointmentUnavailableModal> = {
	title: 'AppointmentUnavailableModal',
	component: AppointmentUnavailableModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AppointmentUnavailableModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<AppointmentUnavailableModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
					);
				}}
			</ModalStoryWrapper>
		);
	},
};
