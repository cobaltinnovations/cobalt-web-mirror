import ReauthModal from '@/components/reauth-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof ReauthModal> = {
	title: 'ReauthModal',
	component: ReauthModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ReauthModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return <ReauthModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />;
				}}
			</ModalStoryWrapper>
		);
	},
	args: {},
};
