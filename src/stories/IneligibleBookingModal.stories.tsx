import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof IneligibleBookingModal> = {
	title: 'IneligibleBookingModal',
	component: IneligibleBookingModal,
	parameters: {},
	tags: ['autodocs'],
	argTypes: {
		uiType: {
			control: { type: 'select' },
			options: ['provider', 'group-session'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof IneligibleBookingModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return <IneligibleBookingModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />;
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		uiType: 'provider',
	},
};
