import ConsentModal from '@/components/consent-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof ConsentModal> = {
	title: 'ConsentModal',
	component: ConsentModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ConsentModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return <ConsentModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />;
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		readOnly: false,
	},
};
