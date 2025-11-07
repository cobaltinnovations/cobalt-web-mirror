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
					<h5 className="mb-4">Page Subscriptions</h5>
					<p className="mb-0">
						To stop receiving emails from pages you follow, click Unsubscribe at the bottom of any email.
					</p>
				</Card.Body>
			</Card>
		</>
	);
};
