import React, { FC, useEffect, useState, Fragment, ComponentType, useMemo } from 'react';
import { ModalProps, Modal, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { assessmentService } from '@/lib/services';
import { uniq } from 'lodash';
import classNames from 'classnames';
import { PersonalizationQuestion, PersonalizationChoice } from '@/lib/models';
import Media from 'react-media';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { screenWidths } from '@/jss/media-queries';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { ContentAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import useTrackModalView from '@/hooks/use-track-modal-view';

const usePersonalizeRecommendationsModalStyles = createUseThemedStyles((theme) => ({
	personalizeRecommendationModal: {
		display: 'flex',
		alignItems: 'flex-end',
		margin: 0,
		height: '100%',
		maxWidth: '100%',
		'& .modal-content': {
			height: 'calc(100% - 54px)', // header height
			overflowX: 'scroll',
		},
	},
	modalTitle: {
		...theme.fonts.large,
		...theme.fonts.headingBold,
	},
	clearLink: {
		...theme.fonts.default,
		...theme.fonts.bodyBold,
	},
	closeIcon: {
		marginRight: 25,
		width: 14,
		height: 14,
		cursor: 'pointer',
		'& polygon': {
			fill: theme.colors.n900,
		},
		'&:focus': {
			outline: 'none',
		},
	},
	modalContentWrapper: {
		height: 'calc(100vh - 76px)',
		overflow: 'scroll',
	},
	modalFooter: {
		height: 76,
		borderTop: `1px solid ${theme.colors.border}`,
	},
}));

const useQuestionItemStyles = createUseThemedStyles((theme) => ({
	horizontalScroller: {
		display: 'flex',
		overflowX: 'scroll',
		padding: '0 20px',
		margin: '0 -20px',
	},
	pill: {
		margin: 5,
		...theme.fonts.small,
		borderRadius: 500,
		appearance: 'none',
		padding: '4px 12px',
		whiteSpace: 'nowrap',
		...theme.fonts.bodyNormal,
		textTransform: 'uppercase',
		backgroundColor: theme.colors.n100,
		border: `1px solid ${theme.colors.border}`,
		'&:focus': {
			outline: 'none',
		},
	},
	selectedPill: {
		color: theme.colors.n0,
		backgroundColor: theme.colors.n900,
	},
	borderBottom: {
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	item: {
		padding: '10px 20px',
	},
	fullWidthItem: {
		padding: '10px 0',
	},
	nestedItem: {
		padding: '10px 34px',
	},
}));

interface PersonalizeRecommendationsModalProps extends ModalProps {
	questions: PersonalizationQuestion[];
	initialChoices: Record<string, PersonalizationChoice['selectedAnswers']>;
	onClose: (updatedChoices: Record<string, PersonalizationChoice['selectedAnswers']>) => void;
}

const PersonalizeRecommendationsModal: FC<PersonalizeRecommendationsModalProps> = ({
	questions,
	initialChoices,
	onClose,
	...props
}) => {
	useTrackModalView('PersonalizeRecommendationsModal', props.show);
	const handleError = useHandleError();
	const classes = usePersonalizeRecommendationsModalStyles();
	const { trackEvent } = useAnalytics();

	const [choices, setChoices] = useState<Record<string, PersonalizationChoice['selectedAnswers']>>({});
	const hasSelectedChoices = useMemo(() => {
		return Object.values(choices).some((questionAnswers) => questionAnswers.length > 0);
	}, [choices]);

	useEffect(() => {
		if (!props.show) {
			return;
		}

		setChoices(initialChoices);
	}, [props.show, initialChoices]);

	const handleApplyFilters = () => {
		trackEvent(ContentAnalyticsEvent.applyFilter('Focus'));

		const updatedChoices = Object.entries(choices).map(([questionId, selectedAnswers]) => ({
			questionId,
			selectedAnswers,
		}));

		const request = assessmentService.setPersonalizationDetails(updatedChoices);

		request
			.fetch()
			.then(() => {
				onClose(choices);
			})
			.catch((e) => {
				handleError(e);
			});
	};

	return (
		<Modal {...props} dialogClassName={classes.personalizeRecommendationModal}>
			<div className={classes.modalContentWrapper}>
				<Modal.Header>
					<Modal.Title className="d-flex">
						<CloseIcon tabIndex={0} className={classes.closeIcon} onClick={handleApplyFilters} />
						<div>
							<p className={classNames('m-0', classes.modalTitle)}>Personalize Recommendations</p>

							{hasSelectedChoices && (
								<Link
									to="#"
									className={classes.clearLink}
									onClick={() => {
										const clearChoices = Object.keys(choices).reduce((updates, questionId) => {
											return {
												...updates,
												[questionId]: [],
											};
										}, {} as typeof choices);

										setChoices(clearChoices);
									}}
								>
									Clear all selections
								</Link>
							)}
						</div>
					</Modal.Title>
				</Modal.Header>

				<Modal.Body className="p-0">
					<Media
						queries={{
							isDesktop: `(min-width: ${screenWidths.md}px)`,
						}}
					>
						{(mq) =>
							questions.map((question) => {
								let Komponent: ComponentType<PersonalizationQuestionProps> | null = null;

								if (question.questionType === 'HORIZONTAL_CHECKBOX') {
									Komponent = mq.isDesktop
										? PersonalizationCheckbox
										: PersonalizationHorizontalCheckbox;
								} else if (question.questionType === 'CHECKBOX') {
									Komponent = PersonalizationCheckbox;
								}

								if (!Komponent) {
									return null;
								}

								return (
									<Komponent
										key={question.questionId}
										question={question}
										choices={choices}
										onChange={(questionId, answers) => {
											setChoices({
												...choices,
												[questionId]: answers,
											});
										}}
									/>
								);
							})
						}
					</Media>
				</Modal.Body>
			</div>

			<div className={classNames('d-flex justify-content-center align-items-center', classes.modalFooter)}>
				<Button size="sm" onClick={handleApplyFilters}>
					Apply Filters
				</Button>
			</div>
		</Modal>
	);
};

interface PersonalizationQuestionProps {
	question: PersonalizationQuestion;
	choices: Record<string, PersonalizationChoice['selectedAnswers']>;
	onChange: (questionId: string, answers: PersonalizationChoice['selectedAnswers']) => void;
	nested?: boolean;
	bottomBordered?: boolean;
	fullWidth?: boolean;
}

const PersonalizationHorizontalCheckbox: FC<PersonalizationQuestionProps> = ({ question, choices, onChange }) => {
	const classes = useQuestionItemStyles();
	const selectedAnswers = choices[question.questionId] || [];

	return (
		<div className={classes.item}>
			<p>
				<strong>{question.label}</strong>
			</p>

			<div className={classes.horizontalScroller}>
				{question.answers.map((answer) => {
					const answerIsSelected = selectedAnswers.findIndex((sA) => sA.answerId === answer.answerId) > -1;

					return (
						<Fragment key={answer.answerId}>
							<button
								className={classNames(classes.pill, {
									[classes.selectedPill]: answerIsSelected,
								})}
								onClick={() => {
									const answers = answerIsSelected
										? selectedAnswers.filter((a) => a.answerId !== answer.answerId)
										: uniq([...selectedAnswers, { answerId: answer.answerId }]);

									onChange(question.questionId, answers);
								}}
							>
								{answer.label}
							</button>
						</Fragment>
					);
				})}
			</div>
		</div>
	);
};

export const PersonalizationCheckbox: FC<PersonalizationQuestionProps> = ({
	question,
	choices,
	onChange,
	nested = false,
	bottomBordered = true,
	fullWidth = false,
}) => {
	const classes = useQuestionItemStyles();
	const selectedAnswers = choices[question.questionId] || [];

	return (
		<div
			className={`${nested ? classes.nestedItem : ''} ${bottomBordered ? classes.borderBottom : ''} ${
				fullWidth ? classes.fullWidthItem : classes.item
			}`}
		>
			<p className={fullWidth ? 'px-9' : ''}>
				<strong>{question.label}</strong>
			</p>

			{question.answers.map((answer) => {
				const answerIsSelected = selectedAnswers.findIndex((sA) => sA.answerId === answer.answerId) > -1;

				return (
					<div key={answer.answerId} className={fullWidth ? `py-1 px-9 ${classes.borderBottom}` : ''}>
						<Form.Check
							type="checkbox"
							id={answer.answerId}
							name={answer.answerId}
							label={answer.label}
							checked={answerIsSelected}
							onChange={() => {
								const answers = answerIsSelected
									? selectedAnswers.filter((a) => a.answerId !== answer.answerId)
									: uniq([...selectedAnswers, { answerId: answer.answerId }]);

								onChange(question.questionId, answers);
							}}
						/>

						{answer.question && answerIsSelected && (
							<PersonalizationCheckbox
								nested
								question={answer.question}
								choices={choices}
								onChange={onChange}
								bottomBordered={false}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default PersonalizeRecommendationsModal;
