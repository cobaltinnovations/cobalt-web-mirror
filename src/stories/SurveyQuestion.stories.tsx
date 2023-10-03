import SurveyQuestion from '@/components/survey-question';
import { QUESTION_TYPE } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof SurveyQuestion> = {
	title: 'SurveyQuestion',
	component: SurveyQuestion,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SurveyQuestion>;

export const Default: Story = {
	render: (args) => {
		return (
			<div>
				<p>Supported Question Types: {Object.keys(QUESTION_TYPE).join(', ')}</p>

				<SurveyQuestion {...args} />
			</div>
		);
	},
	args: {
		question: {
			questionId: 'question-fixture-id-1',
			// fontSizeId?: string;
			questionTitle: 'Question Title',
			questionType: QUESTION_TYPE.DATE,
			answers: [
				{
					answerId: 'answer-fixture-id-1',
					answerDescription: 'Answer 1 Description',
					isCrisis: false,
					isCall: false,
				},
				{
					answerId: 'answer-fixture-id-2',
					answerDescription: 'Answer 2 Description',
					isCrisis: false,
					isCall: false,
				},
				{
					answerId: 'answer-fixture-id-3',
					answerDescription: 'Answer 3 Description',
					isCrisis: false,
					isCall: false,
				},
				{
					answerId: 'answer-fixture-id-4',
					answerDescription: 'Answer 4 Description',
					isCrisis: false,
					isCall: false,
				},
			],
			selectedAnswerIds: [],
			selectedAssessmentAnswers: [
				{
					answerId: 'answer-fixture-id-1',
				},
			],
		},
		onChange: () => {
			//
		},
	},
};
