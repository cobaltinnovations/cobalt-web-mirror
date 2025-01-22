import React, { FC, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelper from '@/components/input-helper';
import { BACKGROUND_COLOR_ID, PAGE_STATUS_ID, PageSectionDetailModel } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import { pagesService } from '@/lib/services';

const useStyles = createUseThemedStyles(() => ({
	modal: {
		maxWidth: 480,
	},
}));

interface AddPageSectionModalProps extends ModalProps {
	pageId: string;
	pageStatusId: PAGE_STATUS_ID;
	onSave(pageSection: PageSectionDetailModel): void;
}

export const AddPageSectionModal: FC<AddPageSectionModalProps> = ({ pageId, pageStatusId, onSave, ...props }) => {
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

		try {
			const response = await pagesService
				.createPageSection(pageId, {
					name: formValues.name,
					backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
					pageStatusId,
				})
				.fetch();

			onSave({ ...response.pageSection, pageRows: [] });
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
