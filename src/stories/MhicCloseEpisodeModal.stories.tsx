import { MhicCloseEpisodeModal } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import referenceDataJSON from '@/fixtures/reference-data.json';
import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicCloseEpisodeModal> = {
	title: 'MhicCloseEpisodeModal',
	component: MhicCloseEpisodeModal,
	parameters: {
		reactRouter: icMhicRouterParams,
		msw: {
			handlers: [
				rest.get('/patient-order-closure-reasons', (req, res, ctx) => {
					return res(
						ctx.json({
							patientOrderClosureReasons: [
								{
									patientOrderClosureReasonId: 'reason-id-1',
									description: 'Reason 1',
								},
								{
									patientOrderClosureReasonId: 'reason-id-2',
									description: 'Reason 2',
								},
							],
						})
					);
				}),
			],
		},
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicCloseEpisodeModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicCloseEpisodeModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
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
			//
		},
	},
};
