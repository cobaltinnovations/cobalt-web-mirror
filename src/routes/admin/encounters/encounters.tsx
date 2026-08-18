import React, { useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import InputHelperSearch from '@/components/input-helper-search';
import TabBar from '@/components/tab-bar';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';

type EncounterStatus = 'open' | 'closed';

interface Encounter {
	encounterId: string;
	created: string;
	patientName: string;
	appointmentDate: string;
	appointmentTime: string;
}

export async function loader() {
	return null;
}

export const Component = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeStatus = useMemo<EncounterStatus>(
		() => (searchParams.get('status') === 'closed' ? 'closed' : 'open'),
		[searchParams]
	);
	const [encounters] = useState<Encounter[]>([
		{
			encounterId: 'encounter-1',
			created: 'Jul 28, 2026',
			patientName: 'Avery Morgan',
			appointmentDate: 'Jul 28, 2026',
			appointmentTime: '10:00 AM',
		},
		{
			encounterId: 'encounter-2',
			created: 'Jul 28, 2026',
			patientName: 'Jordan Lee',
			appointmentDate: 'Jul 29, 2026',
			appointmentTime: '11:30 AM',
		},
		{
			encounterId: 'encounter-3',
			created: 'Jul 29, 2026',
			patientName: 'Taylor Brooks',
			appointmentDate: 'Jul 30, 2026',
			appointmentTime: '9:00 AM',
		},
		{
			encounterId: 'encounter-4',
			created: 'Jul 29, 2026',
			patientName: 'Riley Parker',
			appointmentDate: 'Jul 31, 2026',
			appointmentTime: '2:00 PM',
		},
		{
			encounterId: 'encounter-5',
			created: 'Jul 30, 2026',
			patientName: 'Casey Bennett',
			appointmentDate: 'Aug 3, 2026',
			appointmentTime: '1:30 PM',
		},
		{
			encounterId: 'encounter-6',
			created: 'Jul 30, 2026',
			patientName: 'Cameron Davis',
			appointmentDate: 'Aug 4, 2026',
			appointmentTime: '3:00 PM',
		},
	]);

	const handleTabClick = (status: string) => {
		setSearchParams((currentSearchParams) => {
			const nextSearchParams = new URLSearchParams(currentSearchParams);
			nextSearchParams.set('status', status);
			return nextSearchParams;
		});
	};

	return (
		<Container fluid className="px-8 py-8">
			<Row>
				<Col>
					<div className="mb-6 d-flex align-items-center justify-content-between gap-4">
						<h2 className="mb-0">Encounters</h2>
						<InputHelperSearch style={{ width: 335 }} placeholder="Search" onClear={() => undefined} />
					</div>
					<hr />
				</Col>
			</Row>

			<Row className="mb-8">
				<Col>
					<TabBar
						value={activeStatus}
						tabs={[
							{ value: 'open', title: 'Open' },
							{ value: 'closed', title: 'Closed' },
						]}
						onTabClick={handleTabClick}
					/>
				</Col>
			</Row>

			<Row>
				<Col>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell header minWidth="max-content">
									Created
								</TableCell>
								<TableCell header width="45%">
									Patient
								</TableCell>
								<TableCell header width="45%">
									Appointment Date
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{encounters.map((encounter) => (
								<TableRow key={encounter.encounterId}>
									<TableCell className="text-nowrap" minWidth="max-content">
										{encounter.created}
									</TableCell>
									<TableCell width="45%">{encounter.patientName}</TableCell>
									<TableCell width="45%">
										<span>{encounter.appointmentDate}</span>
										<span>{encounter.appointmentTime}</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Col>
			</Row>
		</Container>
	);
};
