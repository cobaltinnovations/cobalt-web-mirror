import CollectPhoneModal from '@/components/collect-phone-modal';
import { ScreeningFlowSkipTypeId } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof CollectPhoneModal> = {
	title: 'CollectPhoneModal',
	component: CollectPhoneModal,
	parameters: {},
	tags: ['autodocs'],
	argTypes: {
		screeningFlowSkipTypeId: {
			control: {
				type: 'select',
			},
			options: Object.values(ScreeningFlowSkipTypeId),
		},
	},
};

export default meta;

type Story = StoryObj<typeof CollectPhoneModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<CollectPhoneModal
							show={isShowing}
							onHide={() => setIsShowing(false)}
							{...args}
							onSkip={() => {
								setIsShowing(false);
								args.onSkip();
							}}
						/>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		skippable: true,
		screeningFlowSkipTypeId: ScreeningFlowSkipTypeId.EXIT,
		onSkip: () => {
			alert('Skip Clicked');
		},
		onSuccess: () => {
			alert('Success Clicked');
		},
	},
};
