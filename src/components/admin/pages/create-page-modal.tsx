import React, { FC, useEffect, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import useDebouncedState from '@/hooks/use-debounced-state';
import { PAGE_LOCATION_ID, PAGE_STATUS_ID, PageDetailModel, PageFriendlyUrlValidationResult } from '@/lib/models';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import useHandleError from '@/hooks/use-handle-error';
import { pagesService } from '@/lib/services';
import SvgIcon from '@/components/svg-icon';
import { PageLocationSelect } from './page-location-select';

const useStyles = createUseThemedStyles((_theme) => ({
	modal: {
		maxWidth: 620,
	},
}));

interface AddPageModalProps extends ModalProps {
	page?: PageDetailModel;
	onContinue(pageId: string): void;
}

const initialFormValues = {
	pageName: '',
	friendlyUrl: '',
	pageLocationId: PAGE_LOCATION_ID.UNCATEGORIZED,
};

export const AddPageModal: FC<AddPageModalProps> = ({ page, onContinue, ...props }) => {
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
		setUrlNameSetByUser(false);
		setUrlNameValidation(undefined);
	};

	const handleOnEntered = () => {
		nameInputRef.current?.focus();
	};

	useEffect(() => {
		if (
			!props.show ||
			!debouncedPageNameQuery ||
			debouncedPageNameQuery !== formValues.pageName ||
			urlNameSetByUser
		) {
			return;
		}

		const request = pagesService.validatePageUrl({
			searchQuery: debouncedPageNameQuery,
		});
		let active = true;
		request
			.fetch()
			.then((response) => {
				if (!active) return;
				setFormValues((previousValues) => ({
					...previousValues,
					friendlyUrl: response.pageUrlNameValidationResult.recommendation,
				}));
			})
			.catch((error) => {
				if (active) handleError(error);
			});
		return () => {
			active = false;
			request.abort();
		};
	}, [debouncedPageNameQuery, formValues.pageName, props.show, urlNameSetByUser, handleError]);

	useEffect(() => {
		if (!props.show || !debouncedFriendlyUrlQuery || debouncedFriendlyUrlQuery !== formValues.friendlyUrl) {
			return;
		}

		const request = pagesService.validatePageUrl({
			searchQuery: debouncedFriendlyUrlQuery,
		});
		let active = true;
		request
			.fetch()
			.then((response) => {
				if (active) setUrlNameValidation(response.pageUrlNameValidationResult);
			})
			.catch((error) => {
				if (active) handleError(error);
			});
		return () => {
			active = false;
			request.abort();
		};
	}, [debouncedFriendlyUrlQuery, formValues.friendlyUrl, props.show, handleError]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);

		try {
			const response = page
				? await pagesService
						.duplicatePage(page.pageId, {
							name: formValues.pageName,
							urlName: formValues.friendlyUrl,
							copyForEditing: false,
						})
						.fetch()
				: await pagesService
						.createPage({
							name: formValues.pageName,
							urlName: formValues.friendlyUrl,
							pageStatusId: PAGE_STATUS_ID.DRAFT,
							pageLocationId: formValues.pageLocationId,
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
				<Modal.Title>{page ? `Duplicate "${page.name}"` : 'Create Page'}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<fieldset disabled={isSubmitting}>
					<Modal.Body>
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
									friendlyUrl: currentTarget.value.toLowerCase(),
								}));
							}}
							onBlur={() => {
								if (!formValues.friendlyUrl) {
									setUrlNameSetByUser(false);
								}
							}}
							required
						/>
						{urlNameValidation?.available === false ? null : (
							<div className="mb-4 d-flex align-items-center">
								<SvgIcon
									kit="fas"
									icon="circle-info"
									size={16}
									className="me-1 text-n500 flex-shrink-0"
								/>
								<p className="mb-0 small">
									{window.location.host}/pages/
									<span className="fw-bold">{formValues.friendlyUrl}</span>
								</p>
							</div>
						)}
						{!page && (
							<PageLocationSelect
								value={formValues.pageLocationId}
								enabled={!!props.show}
								onChange={(pageLocationId) =>
									setFormValues((previous) => ({ ...previous, pageLocationId }))
								}
							/>
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
