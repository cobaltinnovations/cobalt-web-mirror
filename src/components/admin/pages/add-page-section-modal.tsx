import React, { FC, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelper from '@/components/input-helper';
import { BACKGROUND_COLOR_ID } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import { pagesService } from '@/lib/services';
import { cloneDeep } from 'lodash';
import usePageBuilderContext from '@/hooks/use-page-builder-context';

const useStyles = createUseThemedStyles(() => ({
	modal: {
		maxWidth: 480,
	},
}));

interface AddPageSectionModalProps extends ModalProps {}

export const AddPageSectionModal: FC<AddPageSectionModalProps> = ({ onPageSectionAdded, ...props }) => {
	const { page, setPage, setCurrentPageSectionId } = usePageBuilderContext();
	const classes = useStyles();
	const handleError = useHandleError();
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [formValues, setFormValues] = useState({ name: '' });

	const handleOnEnter = () => {
		setFormValues({ name: '' });
	};

	const handleOnEntered = () => {
		nameInputRef.current?.focus();
	};

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!page) {
			return;
		}

		try {
			const response = await pagesService
				.createPageSection(page.pageId, {
					name: formValues.name,
					backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
					pageStatusId: page.pageStatusId,
				})
				.fetch();

			const formattedSection = { ...response.pageSection, pageRows: [] };

			const pageClone = cloneDeep(page);
			pageClone.pageSections = [...pageClone.pageSections, formattedSection];
			setPage(pageClone);

			setCurrentPageSectionId(response.pageSection.pageSectionId);
			props.onHide?.();
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Add section</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						ref={nameInputRef}
						type="text"
						label="Name"
						value={formValues.name}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								name: currentTarget.value,
							}));
						}}
						required
					/>
				</Modal.Body>
				<Modal.Footer>
					<div className="text-right">
						<Button type="button" variant="outline-primary" onClick={props.onHide}>
							Cancel
						</Button>
						<Button type="submit" className="ms-2" variant="primary">
							Add
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
