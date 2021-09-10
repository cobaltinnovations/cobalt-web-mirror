// @ts-nocheck
import React, { FC } from 'react';
import { Form, FormCheck } from 'react-bootstrap';

enum Care {
	pic = 'PIC',
	specialty = 'Specialty',
}

const TriageRadioButton: FC<Props> = (props) => {
	const { triage, handleUpdateTriage, triageDiagnosis } = props;

	const findCareLabel = (id) => {
		switch (id) {
			case 1:
				return Care.pic;
			case 2:
				return Care.specialty;
			default:
				return '';
		}
	};

	const determineLabelString = (triage) => {
		return `${findCareLabel(triage.value.care)} ${findCareLabel(triage.value.care) ? ':' : ''} ${triage.label}`;
	};

	return (
		<Form.Check
			type="radio"
			bsPrefix="cobalt-modal-form__check"
			id={triage.label}
			name={triage.label}
			label={determineLabelString(triage)}
			checked={triageDiagnosis === triage.value.diagnoses}
			onChange={(e) => {
				handleUpdateTriage(triage.value.diagnoses);
			}}
		/>
	);
};

export default TriageRadioButton;
