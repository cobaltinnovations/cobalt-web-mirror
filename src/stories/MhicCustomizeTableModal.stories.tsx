import { MhicCustomizeTableModal } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import { PatientOrderModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicCustomizeTableModal> = {
	title: 'MhicCustomizeTableModal',
	component: MhicCustomizeTableModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicCustomizeTableModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicCustomizeTableModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		patientOrder: patientOrderJSON as unknown as PatientOrderModel,
		onSave: () => {
			//
		},
	},
};
