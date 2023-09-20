import ConfirmCancelBookingModal from '@/components/confirm-cancel-booking-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof ConfirmCancelBookingModal> = {
	title: 'ConfirmCancelBookingModal',
	component: ConfirmCancelBookingModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ConfirmCancelBookingModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return <ConfirmCancelBookingModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />;
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		onConfirm: () => {
			alert('confirmed');
		},
	},
};
