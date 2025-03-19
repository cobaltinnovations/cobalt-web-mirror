import React from 'react';
import { Button } from 'react-bootstrap';
import { ScreeningConfirmationPrompt } from '@/lib/models';
import ScreeningPromptImage from '@/components/screening-prompt-image';

interface ScreeningQuestionPromptPromps {
	screeningConfirmationPrompt: ScreeningConfirmationPrompt;
	onDismiss(): void;
}

export const ScreeningQuestionPrompt = ({ screeningConfirmationPrompt, onDismiss }: ScreeningQuestionPromptPromps) => {
	return (
		<div>
			{screeningConfirmationPrompt.screeningImageId && (
				<ScreeningPromptImage screeningImageId={screeningConfirmationPrompt.screeningImageId} />
			)}
			<h1>{screeningConfirmationPrompt.titleText}</h1>
			<p>{screeningConfirmationPrompt.text}</p>
			<Button type="button" onClick={onDismiss}>
				{screeningConfirmationPrompt.actionText}
			</Button>
		</div>
	);
};
