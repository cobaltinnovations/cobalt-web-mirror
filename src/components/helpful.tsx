import { createUseThemedStyles } from '@/jss/theme';
import React, { useCallback, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import InlineAlert from '@/components/inline-alert';
import LoadingButton from '@/components/loading-button';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as ThumpUpIcon } from '@/assets/icons/thumb-up.svg';
import { ReactComponent as ThumpDownIcon } from '@/assets/icons/thumb-down.svg';

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
	title: string;
	className?: string;
}

enum DISPLAY_STATES {
	BUTTONS = 'BUTTONS',
	FORM = 'FORM',
	FEEDBACK_YES = 'FEEDBACK_YES',
	FEEDBACK_NO = 'FEEDBACK_NO',
}

const Helpful = ({ title, className }: HelpfulProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [displayState, setDisplayState] = useState(DISPLAY_STATES.BUTTONS);
	const [textareaValue, setTextareaValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handlePositiveFormSubmit = useCallback(() => {
		try {
			setIsSubmitting(true);
			setTimeout(() => {
				setDisplayState(DISPLAY_STATES.FEEDBACK_YES);
			}, 2000);
		} catch (error) {
			handleError(error);
		} finally {
			setTimeout(() => {
				setIsSubmitting(false);
			}, 2000);
		}
	}, [handleError]);

	const handleNegativeFormSubmit = useCallback(
		(event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();
			const { value } = event.nativeEvent.submitter as HTMLButtonElement;

			console.log(textareaValue);
			console.log(value);

			try {
				setIsSubmitting(true);
				setTimeout(() => {
					setDisplayState(DISPLAY_STATES.FEEDBACK_NO);
				}, 2000);
			} catch (error) {
				handleError(error);
			} finally {
				setTimeout(() => {
					setIsSubmitting(false);
				}, 2000);
			}
		},
		[handleError, textareaValue]
	);

	return (
		<div className={className}>
			{displayState === DISPLAY_STATES.BUTTONS && (
				<div className={classes.helpful}>
					<div className={classes.helpfulInner}>
						<h4 className="mb-0 text-center">{title}</h4>
						<div className={classes.buttonsOuter}>
							<LoadingButton
								variant="primary"
								className="me-1 p-3"
								onClick={handlePositiveFormSubmit}
								isLoading={isSubmitting}
							>
								<ThumpUpIcon />
							</LoadingButton>
							<LoadingButton
								variant="danger"
								className="ms-1 p-3"
								onClick={() => {
									setDisplayState(DISPLAY_STATES.FORM);
								}}
								isLoading={isSubmitting}
							>
								<ThumpDownIcon />
							</LoadingButton>
						</div>
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
