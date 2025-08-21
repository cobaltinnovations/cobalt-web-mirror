import React, { FC, useEffect, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { PageFriendlyUrlValidationResult } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useDebouncedState from '@/hooks/use-debounced-state';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';

const useStyles = createUseThemedStyles((_theme) => ({
	modal: {
		maxWidth: 480,
	},
}));

interface EditUrlModalProps extends ModalProps {
	onSave(): void;
}

const initialFormValues = {
	friendlyUrl: '',
};

export const EditUrlModal: FC<EditUrlModalProps> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { page, setPage } = usePageBuilderContext();
	const urlInputRef = useRef<HTMLInputElement>(null);

	const [formValues, setFormValues] = useState(initialFormValues);
	const [debouncedFriendlyUrlQuery] = useDebouncedState(formValues.friendlyUrl);
	const [urlNameValidation, setUrlNameValidation] = useState<PageFriendlyUrlValidationResult>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleOnEnter = () => {
		setFormValues(page ? { friendlyUrl: page.urlName } : initialFormValues);
	};

	const handleOnEntered = () => {
		urlInputRef.current?.focus();
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
				throw new Error('page is undefined');
			}

			const response = await pagesService
				.updatePageSettings(page.pageId, {
					name: page.name,
					urlName: formValues.friendlyUrl,
				})
				.fetch();

			setPage(response.page);
			onSave();
		} catch (error) {
			handleError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Edit URL</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<fieldset disabled={isSubmitting}>
					<Modal.Body>
						<p className="mb-4 fw-bold">
							Updating this URL will break any existing links using the previous URL. Proceed with
							caution.
						</p>
						<InputHelper
							ref={urlInputRef}
							className="mb-1"
							type="text"
							label="Friendly URL"
							error={
								urlNameValidation?.available === false ? (
									<div className="d-flex align-items-center">
										<p className="mb-0 small">
											URL is in use. We suggest{' '}
											<Button
												size="sm"
												variant="link"
												className="small p-0 d-inline"
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
										</p>
									</div>
								) : null
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
