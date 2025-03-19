import React from 'react';
import { Button } from 'react-bootstrap';
import { ScreeningConfirmationPrompt } from '@/lib/models';
import ScreeningPromptImage from '@/components/screening-prompt-image';

interface ScreeningQuestionPromptPromps {
	screeningConfirmationPrompt: ScreeningConfirmationPrompt;
	showPreviousButton: boolean;
	onPreviousButtonClick(): void;
	onSubmitButtonClick(): void;
}

export const ScreeningQuestionPrompt = ({
	screeningConfirmationPrompt,
	showPreviousButton,
	onPreviousButtonClick,
	onSubmitButtonClick,
}: ScreeningQuestionPromptPromps) => {
	return (
		<div>
			{screeningConfirmationPrompt.screeningImageId && (
				<ScreeningPromptImage screeningImageId={screeningConfirmationPrompt.screeningImageId} />
			)}
			<h1>{screeningConfirmationPrompt.titleText}</h1>
			<p>{screeningConfirmationPrompt.text}</p>
			<div className="d-flex align-items-center justify-content-between">
				<div>
					{showPreviousButton && (
						<Button type="button" onClick={onPreviousButtonClick}>
							Previous
						</Button>
					)}
				</div>
				<Button type="button" onClick={onSubmitButtonClick}>
					{screeningConfirmationPrompt.actionText}
				</Button>
			</div>
		</div>
	);
};
