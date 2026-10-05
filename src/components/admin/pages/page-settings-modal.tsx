import React, { FC, useEffect, useRef, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { PAGE_LOCATION_ID, PageDetailModel, PageFriendlyUrlValidationResult } from '@/lib/models';
import { pagesService } from '@/lib/services';
import InputHelper from '@/components/input-helper';
import SvgIcon from '@/components/svg-icon';
import useDebouncedState from '@/hooks/use-debounced-state';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { PageLocationSelect } from './page-location-select';
import InlineAlert from '@/components/inline-alert';
import { shouldWarnForPageUrlChange } from '@/lib/utils/page-admin-utils';

const useStyles = createUseThemedStyles((_theme) => ({
	caution: {
		borderRadius: 8,
	},
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
	pageLocationId: PAGE_LOCATION_ID.UNCATEGORIZED,
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
		setUrlNameValidation(undefined);
		setFormValues(
			page
				? {
						pageName: page.name ?? '',
						friendlyUrl: page.urlName ?? '',
						pageLocationId: page.pageLocationId ?? PAGE_LOCATION_ID.UNCATEGORIZED,
				  }
				: initialFormValues
		);
	};

	const handleOnEntered = () => {
		nameInputRef.current?.focus();
	};

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

		try {
			if (!page) {
				throw new Error('page is undefined.');
			}

			const response = await pagesService
				.updatePageSettings(page.pageId, {
					name: formValues.pageName,
					urlName: formValues.friendlyUrl,
					pageLocationId: formValues.pageLocationId,
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
							<div className="mb-4 d-flex align-items-center">
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
								className={`${classes.caution} mb-4`}
								title="Proceed with caution"
								description="Updating the URL will break any existing links using the previous URL."
							/>
						)}
						<PageLocationSelect
							value={formValues.pageLocationId}
							description={page?.pageLocationDescription}
							enabled={!!props.show}
							onChange={(pageLocationId) =>
								setFormValues((previous) => ({ ...previous, pageLocationId }))
							}
						/>
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
