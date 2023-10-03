import { MhicAssessmentModal } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicAssessmentModal> = {
	title: 'MhicAssessmentModal',
	component: MhicAssessmentModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicAssessmentModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicAssessmentModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		screeningType: {
			description: 'Screening Type Description',
			overallScoreMaximum: 10,
			overallScoreMaximumDescription: '10',
			screeningTypeId: 'screening-type-id-1',
		},
		screeningSessionScreeningResult: {
			screeningVersionId: 'screening-version-id-1',
			screeningId: 'screening-id-1',
			screeningVersionNumber: 1,
			screeningTypeId: 'screening-type-id-1',
			screeningName: 'Screening Name',
			screeningScore: {
				overallScore: 10,
				personalAccomplishmentScore: 5,
				depersonalizationScore: 2,
				emotionalExhaustionScore: 1,
			},
			belowScoringThreshold: false,
			screeningQuestionResults: [
				{
					screeningQuestionId: 'screening-question-id-1',
					screeningQuestionIntroText: 'Screening Question Intro Text',
					screeningQuestionText: 'Screening Question 1 Text',
					screeningAnswerResults: [
						{
							screeningAnswerId: 'screening-answer-id-1',
							screeningAnswerOptionId: 'screening-answer-option-id-1',
							answerOptionText: 'Answer Option Text',
							text: 'Answer Text',
							score: 1,
						},
					],
				},
				{
					screeningQuestionId: 'screening-question-id-2',
					screeningQuestionIntroText: 'Screening Question 2 Intro Text',
					screeningQuestionText: 'Screening Question 2 Text',
					screeningAnswerResults: [
						{
							screeningAnswerId: 'screening-answer-id-1',
							screeningAnswerOptionId: 'screening-answer-option-id-1',
							answerOptionText: 'Answer Option Text',
							text: 'Answer Text',
							score: 1,
						},
					],
				},
			],
		},
	},
};
