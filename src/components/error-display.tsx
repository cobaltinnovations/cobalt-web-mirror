import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';

import HeroContainer from '@/components/hero-container';
import RenderJson from '@/components/render-json';
import { checkShouldRefreshChunkLoadError, handleChunkLoadError } from '@/lib/utils/error-utils';

interface ErrorDisplayProps {
	error: any;
	showBackButton?: boolean;
	showRetryButton?: boolean;
	onRetryButtonClick?(): void;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, showBackButton, showRetryButton, onRetryButtonClick }) => {
	const navigate = useNavigate();

	function handleGoBackButtonClick() {
		navigate(-1);
	}

	function handleRetryClick() {
		if (onRetryButtonClick) onRetryButtonClick();
	}

	useEffect(() => {
		const shouldHandleChunkLoadError = checkShouldRefreshChunkLoadError(error);

		if (shouldHandleChunkLoadError) {
			handleChunkLoadError();
		}
	}, [error]);

	return (
		<>
			<HeroContainer>
				<h6 className="mb-0 text-center">We're sorry, an error occurred.</h6>
				<p className="mb-0 text-center">{error.message}</p>
			</HeroContainer>
			<Container className="pt-4 pb-5">
				<Row className="text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{showBackButton && (
							<Button onClick={handleGoBackButtonClick} className="me-2">
								Go Back
							</Button>
						)}
						{showRetryButton && <Button onClick={handleRetryClick}>Retry</Button>}
					</Col>
				</Row>
				<Row>
					<Col>
						<RenderJson json={error} />
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ErrorDisplay;
