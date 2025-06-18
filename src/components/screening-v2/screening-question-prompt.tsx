import React from 'react';
import { Button } from 'react-bootstrap';
import { ScreeningConfirmationPrompt } from '@/lib/models';
import ScreeningPromptImage from '@/components/screening-prompt-image';
import classNames from 'classnames';

interface ScreeningQuestionPromptPromps {
	screeningConfirmationPrompt: ScreeningConfirmationPrompt;
	showPreviousButton: boolean;
	onPreviousButtonClick(): void;
	onSubmitButtonClick(): void;
	className?: string;
}

export const ScreeningQuestionPrompt = ({
	screeningConfirmationPrompt,
	showPreviousButton,
	onPreviousButtonClick,
	onSubmitButtonClick,
	className,
}: ScreeningQuestionPromptPromps) => {
	return (
		<div className={className}>
			{screeningConfirmationPrompt.screeningImageId && (
				<ScreeningPromptImage
					className="mb-6 mx-auto d-block"
					screeningImageId={screeningConfirmationPrompt.screeningImageId}
				/>
			)}
			{screeningConfirmationPrompt.titleText && (
				<h1 className="mb-6 text-center">{screeningConfirmationPrompt.titleText}</h1>
			)}
			<p className="mb-6 text-center">{screeningConfirmationPrompt.text}</p>
			<div
				className={classNames('d-flex align-items-center', {
					'justify-content-center': !showPreviousButton,
					'justify-content-between': showPreviousButton,
				})}
			>
				{showPreviousButton && (
					<Button type="button" onClick={onPreviousButtonClick}>
						Previous
					</Button>
				)}
				<Button type="button" onClick={onSubmitButtonClick}>
					{screeningConfirmationPrompt.actionText}
				</Button>
			</div>
		</div>
	);
};
