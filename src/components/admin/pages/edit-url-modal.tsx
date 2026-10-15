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
import InlineAlert from '@/components/inline-alert';
import { shouldWarnForPageUrlChange } from '@/lib/utils/page-admin-utils';

const useStyles = createUseThemedStyles((_theme) => ({
	modal: {
		maxWidth: 480,
	},
}));

interface EditUrlModalProps extends ModalProps {
	onSave(): void;
	onSaveUrl(pageId: string, urlName: string): Promise<void>;
	friendlyUrl: string;
}

const initialFormValues = {
	friendlyUrl: '',
};

export const EditUrlModal: FC<EditUrlModalProps> = ({ onSave, onSaveUrl, friendlyUrl, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { page } = usePageBuilderContext();
	const urlInputRef = useRef<HTMLInputElement>(null);

	const [formValues, setFormValues] = useState(initialFormValues);
	const [debouncedFriendlyUrlQuery] = useDebouncedState(formValues.friendlyUrl);
	const [urlNameValidation, setUrlNameValidation] = useState<PageFriendlyUrlValidationResult>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const modalSessionRef = useRef(0);
	const modalPageIdRef = useRef<string>();
	const currentPageIdRef = useRef(page?.pageId);
	currentPageIdRef.current = page?.pageId;
	const showRef = useRef(props.show);
	showRef.current = props.show;

	const handleOnEnter = () => {
		modalSessionRef.current += 1;
		modalPageIdRef.current = page?.pageId;
		setIsSubmitting(false);
		setUrlNameValidation(undefined);
		setFormValues(page ? { friendlyUrl } : initialFormValues);
	};

	const handleOnEntered = () => {
		urlInputRef.current?.focus();
	};

	useEffect(() => {
		if (!props.show) {
			modalSessionRef.current += 1;
		} else if (modalPageIdRef.current && modalPageIdRef.current !== page?.pageId) {
			modalSessionRef.current += 1;
			props.onHide?.();
		}
	}, [page?.pageId, props.show, props.onHide]);

	useEffect(() => {
		if (!props.show || !debouncedFriendlyUrlQuery || debouncedFriendlyUrlQuery !== formValues.friendlyUrl) {
			return;
		}

		const request = pagesService.validatePageUrl({
			searchQuery: debouncedFriendlyUrlQuery,
			...(page && { pageId: page.pageId }),
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
	}, [debouncedFriendlyUrlQuery, formValues.friendlyUrl, page, props.show, handleError]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		const modalSession = modalSessionRef.current;

		try {
			const pageId = modalPageIdRef.current;
			if (!pageId || pageId !== currentPageIdRef.current) {
				throw new Error('The page being edited has changed.');
			}

			await onSaveUrl(pageId, formValues.friendlyUrl);
			if (modalSessionRef.current === modalSession && currentPageIdRef.current === pageId && showRef.current) {
				onSave();
			}
		} catch (error) {
			handleError(error);
		} finally {
			if (modalSessionRef.current === modalSession) setIsSubmitting(false);
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
						{shouldWarnForPageUrlChange(page, formValues.friendlyUrl) && (
							<InlineAlert
								variant="danger"
								className="mt-4"
								title="Proceed with caution"
								description="Updating the URL will break any existing links using the previous URL."
							/>
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
