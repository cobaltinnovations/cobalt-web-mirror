import React from 'react';
import classNames from 'classnames';

import NoData from '@/components/no-data';
import { ScreeningSessionResult } from '@/lib/models';

interface Props {
	screeningSessionResult?: ScreeningSessionResult;
}

export const EncounterScreeningAnswers = ({ screeningSessionResult }: Props) => {
	const questions = (screeningSessionResult?.screeningSessionScreeningResults ?? [])
		.flatMap((screeningResult) => screeningResult.screeningQuestionResults ?? [])
		.filter((question) =>
			(question.screeningAnswerResults ?? []).some(
				(answer) => Boolean(answer.answerOptionText?.trim()) || Boolean(answer.text?.trim())
			)
		);

	return questions.length <= 0 ? (
		<NoData title="No Screening Answers" actions={[]} />
	) : (
		<ol className="m-0 p-0 list-unstyled">
			{questions.map((question, questionIndex) => {
				const isLastQuestion = questions.length - 1 === questionIndex;

				return (
					<li
						key={question.screeningQuestionId ?? questionIndex}
						className={classNames('d-flex', {
							'border-bottom mb-4 pb-4': !isLastQuestion,
						})}
					>
						<div>{questionIndex + 1})</div>
						<div className="ps-2 flex-grow-1">
							<div
								className="mb-2"
								dangerouslySetInnerHTML={{ __html: question.screeningQuestionText ?? '' }}
							/>
							{question.screeningAnswerResults?.map((answer, answerIndex) => (
								<div
									key={answer.screeningAnswerId ?? answerIndex}
									className={classNames({
										'mb-1': (question.screeningAnswerResults ?? []).length - 1 !== answerIndex,
									})}
								>
									{answer.answerOptionText && (
										<p className="mb-0 fw-bold">{answer.answerOptionText}</p>
									)}
									{answer.text && <p className="mb-0 fw-semibold">{answer.text}</p>}
								</div>
							))}
						</div>
					</li>
				);
			})}
		</ol>
	);
};
