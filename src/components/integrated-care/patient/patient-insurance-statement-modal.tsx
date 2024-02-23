import classNames from 'classnames';
import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
	flex1: {
		flex: 1,
	},
});

interface Props extends ModalProps {
	onContinue(): void;
}

export const PatientInsuranceStatementModal: FC<Props> = ({ onContinue, ...props }) => {
	const classes = useStyles();

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Body>
				<h3 className="mb-5">Insurance Information</h3>
				<p className="mb-5">
					Please note: Your insurance may cover this service but you will be responsible for any charges such
					as co-pays or co-insurance. If you have health insurance that includes a deductible, you are
					responsible for any amount required to meet your deductible. This may include the full cost of the
					services if you have a high-deductible plan.
				</p>
				<ul className="mb-5">
					<li>
						<p>
							The services in this program may be delivered in person, by phone, or by video. They may
							include consultation between your providers to coordinate your care.
						</p>
					</li>
					<li>
						<p>
							Your providers will share your health information, including information about your mental
							health, with other providers within Penn Medicine for treatment purposes and as otherwise
							allowed by law
						</p>
					</li>
					<li>
						<p>These charges are billed to your insurance each month you are enrolled in the program</p>
					</li>
					<li>
						<p>The first bill may not be received until you've been enrolled for two or more months</p>
					</li>
					<li>
						<p>
							Your insurance company can provide more information if you have any additional questions
							about your coverage or any potential out of pocket expense - to find out, call and ask them
							whether they cover Collaborative Care CPT codes 99492, 99493, 99494, and 99484
						</p>
					</li>
				</ul>
			</Modal.Body>
			<Modal.Footer className="py-5 bg-white">
				<p className="mb-4 fs-small text-gray text-center">
					By clicking “Continue” you acknowledge that you have read and understand the insurance information.
				</p>
				<div className="d-flex align-items-center">
					<Button
						variant="outline-primary"
						className={classNames('me-1', classes.flex1)}
						onClick={props.onHide}
					>
						Close
					</Button>
					<Button variant="primary" className={classNames('ms-1', classes.flex1)} onClick={onContinue}>
						Continue
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};
