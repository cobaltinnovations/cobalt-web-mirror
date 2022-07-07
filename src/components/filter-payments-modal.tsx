import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { PaymentType } from '@/lib/models';

const useFilterPaymentsModalStyles = createUseStyles({
	filterPaymentsModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterPaymentsModalProps extends ModalProps {
	paymentTypes: PaymentType[];
	selectedTypes: PaymentType['paymentTypeId'][];
	onSave(selectedTypes: PaymentType['paymentTypeId'][]): void;
}

const FilterPaymentsModal: FC<FilterPaymentsModalProps> = ({ paymentTypes, selectedTypes, onSave, ...props }) => {
	const classes = useFilterPaymentsModalStyles();

	const [allTypes, setAllTypes] = useState<PaymentType[]>([]);
	const [selected, setSelected] = useState<PaymentType['paymentTypeId'][]>([]);

	useEffect(() => {
		if (props.show) {
			setSelected(selectedTypes);
		}
	}, [props.show, selectedTypes]);

	useEffect(() => {
		setAllTypes(paymentTypes);
	}, [paymentTypes]);

	useEffect(() => {
		setSelected(selectedTypes);
	}, [selectedTypes]);

	return (
		<Modal {...props} dialogClassName={classes.filterPaymentsModal} centered>
			<Modal.Header>
				<h3 className="mb-0">payment type</h3>
			</Modal.Header>
			<Modal.Body>
				{allTypes.map((paymentType) => {
					const isSelected = selected.includes(paymentType.paymentTypeId);

					return (
						<Form.Check
							key={paymentType.paymentTypeId}
							type="checkbox"
							id={paymentType.paymentTypeId}
							name={paymentType.paymentTypeId}
							label={paymentType.description}
							checked={isSelected}
							onChange={() => {
								if (isSelected) {
									setSelected(selected.filter((s) => s !== paymentType.paymentTypeId));
								} else {
									setSelected([...selected, paymentType.paymentTypeId]);
								}
							}}
						/>
					);
				})}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button variant="primary" size="sm" onClick={() => onSave(selected)}>
					save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterPaymentsModal;
