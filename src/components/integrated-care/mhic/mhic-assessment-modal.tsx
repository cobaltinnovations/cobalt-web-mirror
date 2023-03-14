import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import { ScreeningSessionScreeningResult } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	screeningSessionScreeningResult?: ScreeningSessionScreeningResult;
}

export const MhicAssessmentModal: FC<Props> = ({ screeningSessionScreeningResult, ...props }) => {
	const classes = useStyles();

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>{screeningSessionScreeningResult?.screeningName} Score</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-4 d-flex align-items-center justify-content-between">
					<h5 className="mb-0">Questions</h5>
					<p className="mb-0">
						Total Score: {screeningSessionScreeningResult?.screeningScore?.overallScore}/
						<span className="text-danger">[TODO]</span>
					</p>
				</div>
				<div className="border p-4">
					<ol className="m-0 p-0 list-unstyled">
						{(screeningSessionScreeningResult?.screeningQuestionResults ?? []).map(
							(question, questionIndex) => {
								const isLastQuestion =
									(screeningSessionScreeningResult?.screeningQuestionResults ?? []).length - 1 ===
									questionIndex;

								return (
									<li
										key={question.screeningQuestionId}
										className={classNames('d-flex border-bottom', {
											'mb-4': !isLastQuestion,
										})}
									>
										<div>{questionIndex + 1})</div>
										<div className="ps-2 mb-4 flex-grow-1">
											<p className="mb-2">{question.screeningQuestionText}</p>
											{question.screeningAnswerResults?.map((answer) => (
												<div
													key={answer.screeningAnswerId}
													className="d-flex align-items-center justify-content-between"
												>
													<h5 className="mb-0">{answer.answerOptionText}</h5>
													<h5 className="mb-0 text-gray flex-shrink-0">
														Score: {answer.score}
													</h5>
												</div>
											))}
										</div>
									</li>
								);
							}
						)}
					</ol>
				</div>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
