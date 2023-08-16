import React, { FC, useCallback, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { buildBackendDownloadUrl } from '@/lib/utils';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(): void;
}

export const MhicGenerateOrdersModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const inputRef = useRef<HTMLInputElement>(null);
	const [formValues, setFormValues] = useState({ count: '' });

	const handleOnEnter = useCallback(() => {
		setFormValues({ count: '' });
	}, []);

	const handleOnEntered = useCallback(() => {
		inputRef.current?.focus();
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			window.location.href = buildBackendDownloadUrl('/patient-order-csv-generator', {
				orderCount: formValues.count,
			});

			onSave();
		},
		[formValues.count, onSave]
	);

	return (
		<Modal
			{...props}
			dialogClassName={classes.modal}
			centered
			onEntering={handleOnEnter}
			onEntered={handleOnEntered}
		>
			<Modal.Header closeButton>
				<Modal.Title>Generate Orders</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						ref={inputRef}
						type="number"
						label="Count"
						value={formValues.count}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								count: currentTarget.value,
							}));
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
						Cancel
					</Button>
					<Button type="submit">Generate</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
