import React, { FC, useEffect, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import useDebouncedState from '@/hooks/use-debounced-state';
import { PAGE_STATUS_ID, PAGE_TYPE_ID, PageFriendlyUrlValidationResult } from '@/lib/models';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';
import useHandleError from '@/hooks/use-handle-error';
import { pagesService } from '@/lib/services';

const useStyles = createUseThemedStyles((_theme) => ({
	modal: {
		maxWidth: 620,
	},
}));

interface AddPageModalProps extends ModalProps {
	onContinue(pageId: string): void;
}

const pageTypes = [
	{
		pageTypeId: PAGE_TYPE_ID.TOPIC_CENTER,
		title: 'Topic Center',
	},
	{
		pageTypeId: PAGE_TYPE_ID.COMMUNITY,
		title: 'Community',
	},
];

const initialFormValues = {
	pageTypeId: PAGE_TYPE_ID.TOPIC_CENTER,
	pageName: '',
	friendlyUrl: '',
};

export const AddPageModal: FC<AddPageModalProps> = ({ onContinue, ...props }) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [formValues, setFormValues] = useState(initialFormValues);

	const [debouncedPageNameQuery] = useDebouncedState(formValues.pageName);
	const [debouncedFriendlyUrlQuery] = useDebouncedState(formValues.friendlyUrl);
	const [urlNameSetByUser, setUrlNameSetByUser] = useState(false);
	const [urlNameValidation, setUrlNameValidation] = useState<PageFriendlyUrlValidationResult>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleOnEnter = () => {
		setFormValues(initialFormValues);
	};

	const handleOnEntered = () => {
		nameInputRef.current?.focus();
	};

	useEffect(() => {
		if (!debouncedPageNameQuery || urlNameSetByUser) {
			return;
		}

		pagesService
			.validatePageUrl({ searchQuery: debouncedPageNameQuery })
			.fetch()
			.then((response) => {
				setFormValues((previousValues) => ({
					...previousValues,
					friendlyUrl: response.pageUrlNameValidationResult.recommendation,
				}));
			});
	}, [debouncedPageNameQuery, urlNameSetByUser]);

	useEffect(() => {
		if (!debouncedFriendlyUrlQuery) {
			return;
		}

		pagesService
			.validatePageUrl({ searchQuery: debouncedFriendlyUrlQuery })
			.fetch()
			.then((response) => {
				setUrlNameValidation(response.pageUrlNameValidationResult);
			});
	}, [debouncedFriendlyUrlQuery]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await pagesService
				.createPage({
					name: formValues.pageName,
					urlName: formValues.friendlyUrl,
					pageTypeId: formValues.pageTypeId,
					pageStatusId: PAGE_STATUS_ID.DRAFT,
				})
				.fetch();
			onContinue(response.page.pageId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Create page</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<fieldset disabled={isSubmitting}>
					<Modal.Body>
						<InputHelper
							as="select"
							className="mb-4"
							label="Page Type"
							value={formValues.pageTypeId}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									pageTypeId: currentTarget.value as PAGE_TYPE_ID,
								}));
							}}
							required
						>
							<option value="" disabled>
								Select page type...
							</option>
							{pageTypes.map((pt) => (
								<option key={pt.pageTypeId} value={pt.pageTypeId}>
									{pt.title}
								</option>
							))}
						</InputHelper>
						<InputHelper
							ref={nameInputRef}
							className="mb-4"
							type="text"
							label="Page Name"
							value={formValues.pageName}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									pageName: currentTarget.value,
								}));
							}}
							required
						/>
						<InputHelper
							className="mb-1"
							type="text"
							label="Friendly URL"
							error={
								urlNameValidation?.available === false ? (
									<>
										URL is in use. We suggest{' '}
										<Button
											size="sm"
											variant="link"
											className="p-0 d-inline-block"
											onClick={() => {
												setFormValues((previousValue) => ({
													...previousValue,
													friendlyUrl: urlNameValidation.recommendation,
												}));
											}}
										>
											{urlNameValidation.recommendation}
										</Button>{' '}
										instead.
									</>
								) : undefined
							}
							value={formValues.friendlyUrl}
							onChange={({ currentTarget }) => {
								setUrlNameSetByUser(true);
								setFormValues((previousValue) => ({
									...previousValue,
									friendlyUrl: currentTarget.value,
								}));
							}}
							onBlur={() => {
								if (!formValues.friendlyUrl) {
									setUrlNameSetByUser(false);
								}
							}}
							required
						/>
						{!formValues.pageName || urlNameValidation?.available === false ? null : (
							<div className="d-flex align-items-center">
								<InfoIcon className="me-1 text-n500 flex-shrink-0" width={12} height={12} />
								<p className="mb-0 small">
									{window.location.host}/topic/
									<span className="fw-bold">{formValues.friendlyUrl}</span>
								</p>
							</div>
						)}
					</Modal.Body>
					<Modal.Footer>
						<div className="text-right">
							<Button type="button" variant="outline-primary" onClick={props.onHide}>
								Cancel
							</Button>
							<Button type="submit" className="ms-2" variant="primary">
								Continue
							</Button>
						</div>
					</Modal.Footer>
				</fieldset>
			</Form>
		</Modal>
	);
};
