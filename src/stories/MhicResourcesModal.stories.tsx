import { MhicResourcesModal } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import referenceDataJSON from '@/fixtures/reference-data.json';
import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicResourcesModal> = {
	title: 'MhicResourcesModal',
	component: MhicResourcesModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicResourcesModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicResourcesModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		patientOrder: patientOrderJSON as unknown as PatientOrderModel,
		referenceData: referenceDataJSON as unknown as ReferenceDataResponse,
		onSave: () => {
			// save
		},
	},
};
