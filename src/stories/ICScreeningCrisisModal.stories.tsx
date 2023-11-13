import { IcScreeningCrisisModal } from '@/components/integrated-care/patient';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof IcScreeningCrisisModal> = {
	title: 'IcScreeningCrisisModal',
	component: IcScreeningCrisisModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof IcScreeningCrisisModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<IcScreeningCrisisModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {},
};
