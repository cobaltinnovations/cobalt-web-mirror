import React, { useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';

import { CONTENT_FEEDBACK_TYPE_ID, ContentFeedback } from '@/lib/models';
import { contentFeedbackService } from '@/lib/services/content-feedback-service';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import InlineAlert from '@/components/inline-alert';
import LoadingButton from '@/components/loading-button';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import SvgIcon from './svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	helpful: {
		padding: 32,
		borderRadius: 4,
		backgroundColor: theme.colors.n75,
		border: `1px solid ${theme.colors.border}`,
	},
	helpfulInner: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			flexDirection: 'column',
		},
	},
	buttonsOuter: {
		marginLeft: 16,
		display: 'd-flex',
		alignItems: 'center',
		[mediaQueries.lg]: {
			marginTop: 16,
			marginLeft: 0,
		},
	},
}));

export interface HelpfulProps {
	contentId: string;
	title: string;
	className?: string;
}

enum DISPLAY_STATES {
	BUTTONS = 'BUTTONS',
	FORM = 'FORM',
	FEEDBACK_YES = 'FEEDBACK_YES',
	FEEDBACK_NO = 'FEEDBACK_NO',
}

const Helpful = ({ contentId, title, className }: HelpfulProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [displayState, setDisplayState] = useState(DISPLAY_STATES.BUTTONS);
	const [textareaValue, setTextareaValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [contentFeedback, setContentFeedback] = useState<ContentFeedback>();

	const handleThumbFormSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();
			const { value } = event.nativeEvent.submitter as HTMLButtonElement;

			try {
				setIsSubmitting(true);

				const response = await contentFeedbackService
					.createContentFeedback({
						contentId,
						contentFeedbackTypeId: value as CONTENT_FEEDBACK_TYPE_ID,
					})
					.fetch();

				setContentFeedback(response.contentFeedback);
				if (response.contentFeedback.contentFeedbackTypeId === CONTENT_FEEDBACK_TYPE_ID.THUMBS_UP) {
					setDisplayState(DISPLAY_STATES.FEEDBACK_YES);
				} else if (response.contentFeedback.contentFeedbackTypeId === CONTENT_FEEDBACK_TYPE_ID.THUMBS_DOWN) {
					setDisplayState(DISPLAY_STATES.FORM);
				}
			} catch (error) {
				handleError(error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[contentId, handleError]
	);

	const handleNegativeFormSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();
			const { value } = event.nativeEvent.submitter as HTMLButtonElement;

			if (value === 'NO_THANKS') {
				setDisplayState(DISPLAY_STATES.FEEDBACK_NO);
				return;
			}

			try {
				if (!contentFeedback) {
					throw new Error('contentFeedback is undefined.');
				}

				setIsSubmitting(true);

				await contentFeedbackService
					.updateContentFeedback(contentFeedback.contentFeedbackId, {
						contentFeedbackTypeId: CONTENT_FEEDBACK_TYPE_ID.THUMBS_DOWN,
						message: textareaValue,
					})
					.fetch();

				setDisplayState(DISPLAY_STATES.FEEDBACK_NO);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[contentFeedback, handleError, textareaValue]
	);

	return (
		<div className={className}>
			{displayState === DISPLAY_STATES.BUTTONS && (
				<div className={classes.helpful}>
					<div className={classes.helpfulInner}>
						<h4 className="mb-0 text-center">{title}</h4>
						<Form onSubmit={handleThumbFormSubmit} className={classes.buttonsOuter}>
							<LoadingButton
								type="submit"
								variant="primary"
								className="me-1 p-3"
								value={CONTENT_FEEDBACK_TYPE_ID.THUMBS_UP}
								isLoading={isSubmitting}
							>
								<SvgIcon kit="fas" icon="thumbs-up" size={20} />
							</LoadingButton>
							<LoadingButton
								type="submit"
								variant="danger"
								className="ms-1 p-3"
								value={CONTENT_FEEDBACK_TYPE_ID.THUMBS_DOWN}
								isLoading={isSubmitting}
							>
								<SvgIcon kit="fas" icon="thumbs-down" size={20} />
							</LoadingButton>
						</Form>
					</div>
				</div>
			)}

			{displayState === DISPLAY_STATES.FORM && (
				<Form onSubmit={handleNegativeFormSubmit}>
					<InputHelper
						className="mb-2"
						as="textarea"
						label="We're sorry to hear that. Please let us know how we can improve this resource"
						value={textareaValue}
						onChange={({ currentTarget }) => {
							setTextareaValue(currentTarget.value);
						}}
					/>
					<div>
						<LoadingButton
							className="me-2"
							value="SUBMIT"
							type="submit"
							variant="primary"
							isLoading={isSubmitting}
						>
							Submit
						</LoadingButton>
						<LoadingButton
							type="submit"
							value="NO_THANKS"
							variant="outline-primary"
							isLoading={isSubmitting}
						>
							No Thanks
						</LoadingButton>
					</div>
				</Form>
			)}

			{displayState === DISPLAY_STATES.FEEDBACK_YES && (
				<InlineAlert variant="success" title="Thanks for your feedback!" />
			)}

			{displayState === DISPLAY_STATES.FEEDBACK_NO && (
				<InlineAlert variant="success" title="We appreciate your feedback" />
			)}
		</div>
	);
};

export default Helpful;
