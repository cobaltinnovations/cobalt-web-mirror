import React, { useMemo } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { InstitutionLocation } from '@/lib/models';
import { ALL_INSTITUTION_LOCATIONS_ID } from '@/lib/utils';
import {
	buildInstitutionLocationSelectEntries,
	InstitutionLocationSelectEntry,
} from './institution-location-select-options';

interface EmployerSelectionModalProps {
	show: boolean;
	institutionLocations: InstitutionLocation[];
	selectedInstitutionLocationId: string;
	notSureValue?: string;
	onInstitutionLocationSelect(institutionLocationId: string): void;
	onContinue(): void;
	onHide?(): void;
}

const EmployerSelectionModal = ({
	show,
	institutionLocations,
	selectedInstitutionLocationId,
	notSureValue = ALL_INSTITUTION_LOCATIONS_ID,
	onInstitutionLocationSelect,
	onContinue,
	onHide,
}: EmployerSelectionModalProps) => {
	const entries = useMemo(
		() => buildInstitutionLocationSelectEntries(institutionLocations),
		[institutionLocations]
	);
	const groups = entries.filter(
		(entry): entry is Extract<InstitutionLocationSelectEntry, { type: 'group' }> => entry.type === 'group'
	);
	const ungroupedLocations = entries.flatMap((entry) =>
		entry.type === 'location' ? [entry.institutionLocation] : []
	);
	const canContinue =
		selectedInstitutionLocationId === notSureValue ||
		institutionLocations.some((location) => location.institutionLocationId === selectedInstitutionLocationId);

	const renderLocation = (institutionLocation: InstitutionLocation) => (
		<Form.Check
			key={institutionLocation.institutionLocationId}
			className="mb-1 align-items-start"
			type="radio"
			name="employer"
			id={'employer--' + institutionLocation.institutionLocationId}
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
	);

	return (
		<Modal centered show={show} onHide={onHide}>
			<Modal.Header>
				<Modal.Title>Select Employer</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-2 fw-bold">Select your employer so we can display the providers available to you.</p>
				<p className="mb-4 fs-small">Your employment information will not be shared.</p>
				{groups.map((group) => (
					<section key={group.institutionLocationGroupId} aria-label={group.groupLabel}>
						<h3 className="mt-4 mb-3 fs-small fw-bold text-n500">{group.groupLabel}</h3>
						{group.institutionLocations.map(renderLocation)}
					</section>
				))}
				{groups.length > 0 && ungroupedLocations.length > 0 && (
					<h3 className="mt-4 mb-3 fs-small fw-bold text-n500">Other locations</h3>
				)}
				{ungroupedLocations.map(renderLocation)}
				<Form.Check
					type="radio"
					name="employer"
					id="employer--not-sure"
					label={<span className="fw-semibold">I'm not sure / I'd rather not say</span>}
					value={notSureValue}
					checked={selectedInstitutionLocationId === notSureValue}
					onChange={({ currentTarget }) => {
						onInstitutionLocationSelect(currentTarget.value);
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button disabled={!canContinue} onClick={onContinue}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default EmployerSelectionModal;
