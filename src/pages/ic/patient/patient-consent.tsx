import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { MhicInlineAlert } from '@/components/integrated-care/mhic';

const PatientConsent = () => {
	const { account } = useAccount();
	const handleError = useHandleError();
	const navigate = useNavigate();

	const [isSaving, setIsSaving] = useState(false);

	const handleFormSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();

			const { value } = event.nativeEvent.submitter as HTMLButtonElement;
			console.log(value);

			try {
				setIsSaving(true);
				navigate('/ic/patient');
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[handleError, navigate]
	);

	return (
		<Container className="py-20">
			<Row className="mb-8">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<p className="mb-6 fs-large">Hello {account?.firstName ?? 'patient'},</p>
					<p className="mb-6 fs-large">
						This is a follow up from a conversation with your primary care provider who referred you to the
						Penn Integrated Care program for further assessment. There are a couple of options for us to
						connect.
					</p>
					<p className="mb-2 fs-large">First we need to know...</p>
					<h2 className="mb-8">Are you still interested in seeking services for mental health concerns?</h2>
					<Form className="mb-8" onSubmit={handleFormSubmit}>
						<Button
							className="mb-2 d-block w-100 text-left border"
							variant="light"
							size="lg"
							name="consent"
							id="consent-yes"
							value="YES"
							type="submit"
							disabled={isSaving}
						>
							Yes
						</Button>
						<Button
							className="d-block w-100 text-left border"
							variant="light"
							size="lg"
							name="consent"
							id="consent-no"
							value="NO"
							type="submit"
							disabled={isSaving}
						>
							No
						</Button>
					</Form>
					<MhicInlineAlert
						variant="primary"
						title="Your responses are not reviewed in real time"
						description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
					/>
				</Col>
			</Row>
		</Container>
	);
};

export default PatientConsent;
