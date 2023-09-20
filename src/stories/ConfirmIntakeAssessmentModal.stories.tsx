import ConfirmIntakeAssessmentModal from '@/components/confirm-intake-assessment-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof ConfirmIntakeAssessmentModal> = {
	title: 'ConfirmIntakeAssessmentModal',
	component: ConfirmIntakeAssessmentModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ConfirmIntakeAssessmentModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<ConfirmIntakeAssessmentModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
					);
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
