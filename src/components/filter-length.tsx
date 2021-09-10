import React, { FC, useEffect, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterLengthProps extends ModalProps {
	selectedLength: string;
	onSave(selectedLength: string): void;
}

const FilterLength: FC<FilterLengthProps> = ({ selectedLength, onSave, ...props }) => {
	const classes = useStyles();
	const [internalSelectedLength, setInternalSelectedLength] = useState<string>('');

	useEffect(() => {
		if (props.show) {
			setInternalSelectedLength(selectedLength);
		}
	}, [props.show, selectedLength]);

	function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { checked, value } = event.currentTarget;

		if (checked) {
			setInternalSelectedLength(value);
		}
	}

	function handleSaveButtonClick() {
		onSave(internalSelectedLength);
	}

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header>
				<h3 className="mb-0">length</h3>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						name="on-your-time__filter-length"
						id="on-your-time__filter-length--any-time"
						label="any time"
						value={''}
						checked={internalSelectedLength === ''}
						onChange={handleCheckboxChange}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						name="on-your-time__filter-length"
						id="on-your-time__filter-length--under-2-minutes"
						label="under 2 minutes"
						value={`${2}`}
						checked={internalSelectedLength === `${2}`}
						onChange={handleCheckboxChange}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						name="on-your-time__filter-length"
						id="on-your-time__filter-length--under-5-minutes"
						label="under 5 minutes"
						value={`${5}`}
						checked={internalSelectedLength === `${5}`}
						onChange={handleCheckboxChange}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						name="on-your-time__filter-length"
						id="on-your-time__filter-length--under-10-minutes"
						label="under 10 minutes"
						value={`${10}`}
						checked={internalSelectedLength === `${10}`}
						onChange={handleCheckboxChange}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						name="on-your-time__filter-length"
						id="on-your-time__filter-length--under-15-minutes"
						label="under 15 minutes"
						value={`${15}`}
						checked={internalSelectedLength === `${15}`}
						onChange={handleCheckboxChange}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						name="on-your-time__filter-length"
						id="on-your-time__filter-length--under-20-minutes"
						label="under 20 minutes"
						value={`${20}`}
						checked={internalSelectedLength === `${20}`}
						onChange={handleCheckboxChange}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						name="on-your-time__filter-length"
						id="on-your-time__filter-length--under-30-minutes"
						label="under 30 minutes"
						value={`${30}`}
						checked={internalSelectedLength === `${30}`}
						onChange={handleCheckboxChange}
					/>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button variant="primary" size="sm" onClick={handleSaveButtonClick}>
					save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterLength;
