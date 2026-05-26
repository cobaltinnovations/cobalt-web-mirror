import React from 'react';
import { Button } from 'react-bootstrap';
import { ScreeningConfirmationPrompt } from '@/lib/models';
import ScreeningPromptImage from '@/components/screening-prompt-image';
import InlineAlert from '@/components/inline-alert';
import classNames from 'classnames';
import { WysiwygDisplay } from '../wysiwyg-basic';

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
					style={{ maxWidth: '100%' }}
					screeningImageId={screeningConfirmationPrompt.screeningImageId}
				/>
			)}
			{screeningConfirmationPrompt.titleText && (
				<h1 className="mb-6 text-center">{screeningConfirmationPrompt.titleText}</h1>
			)}
			<WysiwygDisplay className="mb-6 text-center" html={screeningConfirmationPrompt.text ?? ''} />
			{screeningConfirmationPrompt.callouts?.map((callout, calloutIndex) => (
				<InlineAlert
					key={calloutIndex}
					className="mb-6"
					title={callout.title ?? ''}
					description={
						callout.descriptionHtml ? (
							<WysiwygDisplay html={callout.descriptionHtml} />
						) : callout.url && callout.urlText ? (
							<a href={callout.url}>{callout.urlText}</a>
						) : undefined
					}
				/>
			))}
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
