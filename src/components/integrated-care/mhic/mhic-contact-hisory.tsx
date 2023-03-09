import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel, PatientOrderOutreachModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import {
	MhicAssessmentModal,
	MhicComment,
	MhicOutreachModal,
	MhicScheduleAssessmentModal,
} from '@/components/integrated-care/mhic';

interface Props {
	patientOrder: PatientOrderModel;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicContactHistory = ({ patientOrder, onPatientOrderChange }: Props) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [showOutreachModal, setShowOutreachModal] = useState(false);
	const [outreachToEdit, setOutreachToEdit] = useState<PatientOrderOutreachModel>();
	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showAssessmentModal, setShowAssessmentModal] = useState(false);

	const handleOutreachModalSave = useCallback(
		async (_patientOrderOutreach: PatientOrderOutreachModel, isEdit: boolean) => {
			try {
				if (!patientOrder.patientOrderId) {
					throw new Error('patientOrder.patientOrderId is undefined.');
				}

				const patientOverviewResponse = await integratedCareService
					.getPatientOrder(patientOrder.patientOrderId)
					.fetch();

				onPatientOrderChange(patientOverviewResponse.patientOrder);
				addFlag({
					variant: 'success',
					title: isEdit ? 'Outreach updated' : 'Outreach added',
					description: '{Message}',
					actions: [],
				});

				setOutreachToEdit(undefined);
				setShowOutreachModal(false);
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	const handleDeleteOutreach = useCallback(
		async (patientOrderOutreachId: string) => {
			if (!window.confirm('Are you sure?')) {
				return;
			}

			try {
				if (!patientOrder.patientOrderId) {
					throw new Error('patientOrder.patientOrderId is undefined.');
				}

				await integratedCareService.deletePatientOrderOutreach(patientOrderOutreachId).fetch();
				const patientOverviewResponse = await integratedCareService
					.getPatientOrder(patientOrder.patientOrderId)
					.fetch();

				onPatientOrderChange(patientOverviewResponse.patientOrder);
				addFlag({
					variant: 'success',
					title: 'Outreach deleted',
					description: '{Message}',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	return (
		<>
			<MhicOutreachModal
				patientOrderId={patientOrder.patientOrderId}
				outreachToEdit={outreachToEdit}
				show={showOutreachModal}
				onHide={() => {
					setShowOutreachModal(false);
				}}
				onSave={handleOutreachModalSave}
			/>

			<MhicScheduleAssessmentModal
				show={showScheduleAssessmentModal}
				onHide={() => {
					setShowScheduleAssessmentModal(false);
				}}
				onSave={() => {
					setShowScheduleAssessmentModal(false);
				}}
			/>

			<MhicAssessmentModal
				show={showAssessmentModal}
				onHide={() => {
					setShowAssessmentModal(false);
				}}
			/>

			<section>
				<Container fluid>
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">Welcome Message</h4>
								<Button
									onClick={() => {
										window.alert('[TODO]: Make the modal for this.');
									}}
								>
									Send Message
								</Button>
							</div>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid className="overflow-visible">
					<Row className={classNames({ 'mb-6': (patientOrder.patientOrderOutreaches ?? []).length > 0 })}>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">
									Outreach Attempts{' '}
									<span className="text-gray">
										({(patientOrder.patientOrderOutreaches ?? []).length})
									</span>
								</h4>
								<Button
									onClick={() => {
										setOutreachToEdit(undefined);
										setShowOutreachModal(true);
									}}
								>
									Add Outreach Attempt
								</Button>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							{(patientOrder.patientOrderOutreaches ?? []).map((outreach, outreachIndex) => {
								const isLast = outreachIndex === (patientOrder.patientOrderOutreaches ?? []).length - 1;
								return (
									<MhicComment
										key={outreach.patientOrderOutreachId}
										className={classNames({ 'mb-4': !isLast })}
										name={outreach.account.displayName ?? ''}
										date={outreach.outreachDateTimeDescription}
										message={outreach.note}
										onEdit={() => {
											setOutreachToEdit(outreach);
											setShowOutreachModal(true);
										}}
										onDelete={() => {
											handleDeleteOutreach(outreach.patientOrderOutreachId);
										}}
									/>
								);
							})}
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
