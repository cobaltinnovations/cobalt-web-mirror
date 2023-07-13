import React, { useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

const DebugError = () => {
	const [showError, setShowError] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShowError(true);
		}, 5000);
	}, []);

	if (showError) {
		throw new Error('Thrown during render');
	}

	return <h3 className="text-center">This component will throw after 5 seconds from rendering.</h3>;
};

const SentryDebugButtons = () => {
	const [showRenderError, setShowRenderError] = useState(false);

	return (
		<Row className="my-6">
			<Col xs={12}>
				<h3 className="mb-2">Sentry Debug UI</h3>
			</Col>

			<Col>
				<Button
					className="me-2"
					onClick={() => {
						throw new Error('Thrown from an event');
					}}
				>
					Throw Error inside event
				</Button>
				<Button
					onClick={() => {
						setShowRenderError(true);
					}}
				>
					Throw Error during render
				</Button>
			</Col>

			{showRenderError && (
				<Col xs={12}>
					<DebugError />
				</Col>
			)}
		</Row>
	);
};

export default SentryDebugButtons;
