import moment from 'moment';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import { PatientOrderOutreachModel, PatientOrderOutreachResult, PatientOrderOutreachTypeId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
	flex1: {
		flex: 1,
	},
});

interface Props extends ModalProps {
	patientOrderId: string;
	patientOrderOutreachTypeId: PatientOrderOutreachTypeId;
	patientOrderOutreachResults: PatientOrderOutreachResult[];
	outreachToEdit?: PatientOrderOutreachModel;
	onSave(patientOrderOutreach: PatientOrderOutreachModel): void;
}

export const MhicOutreachModal: FC<Props> = ({
	patientOrderId,
	patientOrderOutreachTypeId,
	patientOrderOutreachResults,
	outreachToEdit,
	onSave,
	...props
}) => {
	const { institution } = useAccount();
	const handleError = useHandleError();
	const classes = useStyles();
	const { addFlag } = useFlags();
	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		resultId: '',
		comment: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const modalTitleByOutreachTypeId = useMemo(
		() => ({
			[PatientOrderOutreachTypeId.MYCHART_MESSAGE]: `${institution?.myChartName ?? 'MyChart'} Message`,
			[PatientOrderOutreachTypeId.PHONE_CALL]: 'Call',
		}),
		[institution?.myChartName]
	);

	const resultSelectLabelByOutreachTypeId = useMemo(
		() => ({
			[PatientOrderOutreachTypeId.MYCHART_MESSAGE]: 'Message Type',
			[PatientOrderOutreachTypeId.PHONE_CALL]: 'Select Call Result',
		}),
		[]
	);

	const resultGroupsByOutreachTypeId = useMemo(() => {
		const resultGroup: Record<
			string,
			{
				patientOrderOutreachTypeId: string;
				patientOrderOutreachTypeDescription: string;
				optGroups: Record<
					string,
					{
						patientOrderOutreachResultStatusId: string;
						patientOrderOutreachResultStatusDescription: string;
						options: PatientOrderOutreachResult[];
					}
				>;
			}
		> = {};

		patientOrderOutreachResults.forEach((result) => {
			if (resultGroup[result.patientOrderOutreachTypeId]) {
				if (
					resultGroup[result.patientOrderOutreachTypeId].optGroups[result.patientOrderOutreachResultStatusId]
				) {
					resultGroup[result.patientOrderOutreachTypeId].optGroups[
						result.patientOrderOutreachResultStatusId
					].options.push(result);
					return;
				}

				resultGroup[result.patientOrderOutreachTypeId].optGroups[result.patientOrderOutreachResultStatusId] = {
					patientOrderOutreachResultStatusId: result.patientOrderOutreachResultStatusId,
					patientOrderOutreachResultStatusDescription: result.patientOrderOutreachResultStatusDescription,
					options: [result],
				};

				return;
			}

			resultGroup[result.patientOrderOutreachTypeId] = {
				patientOrderOutreachTypeId: result.patientOrderOutreachTypeId,
				patientOrderOutreachTypeDescription: result.patientOrderOutreachTypeDescription,
				optGroups: {
					[result.patientOrderOutreachResultStatusId]: {
						patientOrderOutreachResultStatusId: result.patientOrderOutreachResultStatusId,
						patientOrderOutreachResultStatusDescription: result.patientOrderOutreachResultStatusDescription,
						options: [result],
					},
				},
			};
		});

		return resultGroup;
	}, [patientOrderOutreachResults]);

	const handleOnEnter = useCallback(() => {
		if (outreachToEdit) {
			setFormValues({
				date: new Date(outreachToEdit.outreachDate),
				time: moment(outreachToEdit.outreachTime, 'HH:mm').format('h:mm A'),
				resultId: outreachToEdit.patientOrderOutreachResultId,
				comment: outreachToEdit.note,
			});
			return;
		}

		setFormValues({
			date: new Date(),
			time: moment().format('h:mm A'),
			resultId: '',
			comment: '',
		});
	}, [outreachToEdit]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			try {
				setIsSaving(true);

				let response;
				if (outreachToEdit) {
					response = await integratedCareService
						.updatePatientOrderOutreach(outreachToEdit.patientOrderOutreachId, {
							patientOrderOutreachResultId: formValues.resultId,
							outreachDate: moment(formValues.date).format('YYYY-MM-DD'),
							outreachTime: formValues.time,
							note: formValues.comment,
						})
						.fetch();

					addFlag({
						variant: 'success',
						title: 'Outreach updated',
						description: '{Message}',
						actions: [],
					});
				} else {
					response = await integratedCareService
						.postPatientOrderOutreach({
							patientOrderId,
							patientOrderOutreachResultId: formValues.resultId,
							outreachDate: moment(formValues.date).format('YYYY-MM-DD'),
							outreachTime: formValues.time,
							note: formValues.comment,
						})
						.fetch();

					addFlag({
						variant: 'success',
						title: 'Outreach added',
						description: '{Message}',
						actions: [],
					});
				}

				onSave(response.patientOrderOutreach);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			addFlag,
			formValues.comment,
			formValues.date,
			formValues.resultId,
			formValues.time,
			handleError,
			onSave,
			outreachToEdit,
			patientOrderId,
		]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEntering={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>
					{outreachToEdit ? 'Edit' : 'Log'} {modalTitleByOutreachTypeId[patientOrderOutreachTypeId]}
				</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<div className="mb-4 d-flex align-items-start">
						<div className={classNames(classes.flex1, 'me-2')}>
							<DatePicker
								labelText="Date"
								selected={formValues.date}
								onChange={(date) => {
									setFormValues((previousValues) => ({
										...previousValues,
										date: date ?? undefined,
									}));
								}}
								disabled={isSaving}
								required
							/>
						</div>
						<div className={classNames(classes.flex1, 'ms-2')}>
							<TimeInputV2
								id="outreact-modal__time-input"
								label="Time"
								value={formValues.time}
								onChange={(time) => {
									setFormValues((previousValues) => ({
										...previousValues,
										time,
									}));
								}}
								disabled={isSaving}
								required
							/>
						</div>
					</div>
					<InputHelper
						className="mb-4"
						as="select"
						label={resultSelectLabelByOutreachTypeId[patientOrderOutreachTypeId]}
						value={formValues.resultId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								resultId: currentTarget.value,
							}));
						}}
						required
					>
						<option value="" label="Select..." disabled />
						{Object.values(resultGroupsByOutreachTypeId[patientOrderOutreachTypeId].optGroups).map(
							(optGroup) => (
								<optgroup
									key={optGroup.patientOrderOutreachResultStatusId}
									label={optGroup.patientOrderOutreachResultStatusDescription}
								>
									{optGroup.options.map((option) => (
										<option
											key={option.patientOrderOutreachResultId}
											value={option.patientOrderOutreachResultId}
										>
											{option.patientOrderOutreachResultTypeDescription}
										</option>
									))}
								</optgroup>
							)
						)}
					</InputHelper>
					<InputHelper
						as="textarea"
						label="Comment"
						value={formValues.comment}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								comment: currentTarget.value,
							}));
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button
						variant="primary"
						type="submit"
						disabled={isSaving || !formValues.date || !formValues.time || !formValues.comment}
					>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
