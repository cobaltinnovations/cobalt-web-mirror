import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import useAccount from '@/hooks/use-account';

export async function loader() {
	return null;
}

export const Component = () => {
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Communication Preferences</title>
			</Helmet>

			<Card bsPrefix="ic-card" className="mb-8">
				<Card.Header>
					<Card.Title>Email Notifications</Card.Title>
				</Card.Header>
				<Card.Body>
					<h5 className="mb-4">Communication from Cobalt</h5>
					<div className="mb-6">
						<Form.Check
							type="checkbox"
							name="platformAnnouncments"
							id="platform-announcments"
							value="PLATFORM_ANNOUNCEMENTS"
							label="Occasional platform announcements"
							checked={false}
							onChange={() => {
								return;
							}}
						/>
						<Form.Check
							type="checkbox"
							name="surveys"
							id="surveys"
							value="SURVEYS"
							label="Surveys and invitations to help us improve Cobalt content and your experience"
							checked={false}
							onChange={() => {
								return;
							}}
						/>
					</div>
					<hr className="mb-6" />
					<h5 className="mb-4">Page Updates</h5>
				</Card.Body>
			</Card>
		</>
	);
};
