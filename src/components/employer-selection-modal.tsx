import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { InstitutionLocation } from '@/lib/models';
import { ALL_INSTITUTION_LOCATIONS_ID } from '@/lib/utils';

interface EmployerSelectionModalProps {
	show: boolean;
	institutionLocations: InstitutionLocation[];
	selectedInstitutionLocationId: string;
	onInstitutionLocationSelect(institutionLocationId: string): void;
	onContinue(): void;
	onHide(): void;
}

const EmployerSelectionModal = ({
	show,
	institutionLocations,
	selectedInstitutionLocationId,
	onInstitutionLocationSelect,
	onContinue,
	onHide,
}: EmployerSelectionModalProps) => {
	return (
		<Modal centered show={show} onHide={onHide}>
			<Modal.Header>
				<Modal.Title>Select Employer</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-2 fw-bold">Select your employer so we can display the providers available to you.</p>
				<p className="mb-4 fs-small">Your employment information will not be shared.</p>
				{institutionLocations.map((institutionLocation) => (
					<Form.Check
						key={institutionLocation.institutionLocationId}
						className="mb-1 align-items-start"
						type="radio"
						name="employer"
						id={`employer--${institutionLocation.institutionLocationId}`}
						label={
							<>
								<span className="d-block fw-semibold">
									{institutionLocation.shortName ?? institutionLocation.name}
								</span>
								{institutionLocation.shortName && (
									<span className="d-block text-n500">{institutionLocation.name}</span>
								)}
							</>
						}
						value={institutionLocation.institutionLocationId}
						checked={selectedInstitutionLocationId === institutionLocation.institutionLocationId}
						onChange={({ currentTarget }) => {
							onInstitutionLocationSelect(currentTarget.value);
						}}
					/>
				))}
				<Form.Check
					type="radio"
					name="employer"
					id="employer--not-sure"
					label={<span className="fw-semibold">I'm not sure / I'd rather not say</span>}
					value={ALL_INSTITUTION_LOCATIONS_ID}
					checked={selectedInstitutionLocationId === ALL_INSTITUTION_LOCATIONS_ID}
					onChange={({ currentTarget }) => {
						onInstitutionLocationSelect(currentTarget.value);
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button disabled={!selectedInstitutionLocationId} onClick={onContinue}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default EmployerSelectionModal;
