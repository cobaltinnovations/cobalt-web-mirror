import { MhicFullscreenBar } from '@/components/integrated-care/mhic';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export async function loader() {
	return null;
}

export const Component = () => {
	const navigate = useNavigate();

	return (
		<>
			{/* path matching logic in components/admin/admin-header.tsx hides the default header */}
			<MhicFullscreenBar
				showExitButton={false}
				title="Page Name"
				primaryAction={{
					title: 'Publish',
					onClick: () => navigate(-1),
				}}
				tertiaryAction={{
					title: 'Finish Later',
					onClick: () => navigate(-1),
				}}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<h2 className="mb-0">PageBuilder</h2>
					</Col>
				</Row>
			</Container>
		</>
	);
};
