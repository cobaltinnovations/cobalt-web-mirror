import React, { FC, useCallback } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {}

export const MhicAssessmentModal: FC<Props> = ({ ...props }) => {
	const classes = useStyles();

	const handleOnEnter = useCallback(() => {
		//TODO: Set <select/> values to Patient's values
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>PHQ-9 Score</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-4 d-flex align-items-center justify-content-between">
					<h5 className="mb-0">Questions</h5>
					<p className="mb-0">Total Score: 12/27</p>
				</div>
				<div className="border p-4">
					<ol className="m-0 p-0 list-unstyled">
						<li className="mb-4 d-flex border-bottom">
							<div>1)</div>
							<div className="ps-2 mb-4">
								<p className="mb-2">
									Over the last 2 weeks, how often have you been bothered by... Feeling nervous,
									anxious, or on edge?
								</p>
								<div className="d-flex align-items-center justify-content-between">
									<h5 className="mb-0">Several days</h5>
									<h5 className="mb-0 text-gray">Score: 1</h5>
								</div>
							</div>
						</li>
						<li className="mb-4 d-flex border-bottom">
							<div>2)</div>
							<div className="ps-2 mb-4">
								<p className="mb-2">
									Over the last 2 weeks, how often have you been bothered by... Feeling nervous,
									anxious, or on edge?
								</p>
								<div className="d-flex align-items-center justify-content-between">
									<h5 className="mb-0">Several days</h5>
									<h5 className="mb-0 text-gray">Score: 1</h5>
								</div>
							</div>
						</li>
						<li className="d-flex border-bottom">
							<div>3)</div>
							<div className="ps-2 mb-4">
								<p className="mb-2">
									Over the last 2 weeks, how often have you been bothered by... Feeling nervous,
									anxious, or on edge?
								</p>
								<div className="d-flex align-items-center justify-content-between">
									<h5 className="mb-0">More than half the days</h5>
									<h5 className="mb-0 text-gray">Score: 2</h5>
								</div>
							</div>
						</li>
					</ol>
				</div>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
