import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';
import InCrisisModal from '@/components/in-crisis-modal';

const meta: Meta<typeof InCrisisModal> = {
	title: 'InCrisisModal',
	component: InCrisisModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof InCrisisModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return <InCrisisModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />;
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		isCall: false,
		onConfirm: () => {
			alert('confirmed');
		},
	},
};
