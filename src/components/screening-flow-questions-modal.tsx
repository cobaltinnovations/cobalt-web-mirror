import { ScreeningFlow, ScreeningQuestion } from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';

interface Props extends ModalProps {
	screeningFlow?: ScreeningFlow;
}

export const ScreeningFlowQuestionsModal = ({ screeningFlow, ...modalProps }: Props) => {
	const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);

	useEffect(() => {
		if (!screeningFlow?.screeningFlowId) {
			return;
		}

		setQuestions([]);

		screeningService
			.getInitialScreeningQuestionsByFlowVersionId(screeningFlow.activeScreeningFlowVersionId)
			.fetch()
			.then((response) => {
				setQuestions(response.screeningQuestions);
			});
	}, [screeningFlow?.activeScreeningFlowVersionId, screeningFlow?.screeningFlowId]);

	return (
		<Modal centered {...modalProps}>
			<Modal.Header closeButton>
				<Modal.Title>{screeningFlow?.name}</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<p className="fs-large fw-bold mb-4">{questions.length} Questions total</p>

				<ol>
					{questions.map((question, idx) => {
						return <li key={idx}>{question.questionText}</li>;
					})}
				</ol>
			</Modal.Body>

			<Modal.Footer className="text-right">
				<Button
					size="sm"
					variant="primary"
					onClick={() => {
						modalProps.onHide?.();
					}}
				>
					OK
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
