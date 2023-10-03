import SelectGroupSessionTypeModal from '@/components/select-group-session-type-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof SelectGroupSessionTypeModal> = {
	title: 'SelectGroupSessionTypeModal',
	component: SelectGroupSessionTypeModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SelectGroupSessionTypeModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<SelectGroupSessionTypeModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {},
};
