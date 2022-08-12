import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { PaymentType } from '@/lib/models';
import { useLocation, useSearchParams } from 'react-router-dom';

const useFilterPaymentsModalStyles = createUseStyles({
	filterPaymentsModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterPaymentsModalProps extends ModalProps {
	paymentTypes: PaymentType[];
}

const FilterPaymentsModal: FC<FilterPaymentsModalProps> = ({ paymentTypes, ...props }) => {
	const classes = useFilterPaymentsModalStyles();

	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const [selected, setSelected] = useState(searchParams.getAll('paymentTypeId') as PaymentType['paymentTypeId'][]);

	useEffect(() => {
		if (props.show) {
			const selections = searchParams.getAll('paymentTypeId') as PaymentType['paymentTypeId'][];
			setSelected(selections.length > 0 ? selections : []);
		}
	}, [props.show, searchParams]);

	return (
		<Modal {...props} dialogClassName={classes.filterPaymentsModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>payment type</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{paymentTypes.map((paymentType) => {
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
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							searchParams.delete('paymentTypeId');

							for (const paymentTypeId of selected) {
								searchParams.append('paymentTypeId', paymentTypeId);
							}

							setSearchParams(searchParams, { state: location.state });

							props.onHide?.();
						}}
					>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterPaymentsModal;
