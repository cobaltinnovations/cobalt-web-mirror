import React, { FC, useEffect, useRef, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { PageDetailModel, PageFriendlyUrlValidationResult } from '@/lib/models';
import { pagesService } from '@/lib/services';
import InputHelper from '@/components/input-helper';
import SvgIcon from '@/components/svg-icon';
import useDebouncedState from '@/hooks/use-debounced-state';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((_theme) => ({
	modal: {
		maxWidth: 620,
	},
}));

interface PageSettingsModalProps extends ModalProps {
	page?: PageDetailModel;
	onSaved(page: PageDetailModel): void;
}

const initialFormValues = {
	pageName: '',
	friendlyUrl: '',
};

export const PageSettingsModal: FC<PageSettingsModalProps> = ({ page, onSaved, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const nameInputRef = useRef<HTMLInputElement>(null);

	const [formValues, setFormValues] = useState(initialFormValues);
	const [debouncedFriendlyUrlQuery] = useDebouncedState(formValues.friendlyUrl);
	const [urlNameValidation, setUrlNameValidation] = useState<PageFriendlyUrlValidationResult>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleOnEnter = () => {
		setFormValues(
			page
				? {
						pageName: page.name ?? '',
						friendlyUrl: page.urlName ?? '',
				  }
				: initialFormValues
		);
	};

	const handleOnEntered = () => {
		nameInputRef.current?.focus();
	};

	useEffect(() => {
		if (!debouncedFriendlyUrlQuery) {
			return;
		}

		pagesService
			.validatePageUrl({
				searchQuery: debouncedFriendlyUrlQuery,
				...(page && { pageId: page.pageId }),
			})
			.fetch()
			.then((response) => {
				setUrlNameValidation(response.pageUrlNameValidationResult);
			});
	}, [debouncedFriendlyUrlQuery, page]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);

		try {
			if (!page) {
				throw new Error('page is undefined.');
			}

			const response = await pagesService
				.updatePageSettings(page.pageId, {
					name: formValues.pageName,
					urlName: formValues.friendlyUrl,
				})
				.fetch();

			onSaved(response.page);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Page Settings</Modal.Title>
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
								setFormValues((previousValue) => ({
									...previousValue,
									friendlyUrl: currentTarget.value.toLowerCase(),
								}));
							}}
							required
						/>
						{urlNameValidation?.available === false ? null : (
							<div className="d-flex align-items-center">
								<SvgIcon
									kit="fas"
									icon="circle-info"
									size={16}
									className="me-2 text-n500 flex-shrink-0"
								/>
								<p className="mb-0 small">
									{window.location.host}/pages/
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
								Save
							</Button>
						</div>
					</Modal.Footer>
				</fieldset>
			</Form>
		</Modal>
	);
};
