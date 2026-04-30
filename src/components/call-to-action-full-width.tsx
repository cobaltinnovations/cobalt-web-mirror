import React, { ReactNode } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

interface CallToActionFullWidthProps {
	title: string;
	description?: ReactNode;
	buttonText?: string;
	onButtonClick?: () => void;
	buttonDisabled?: boolean;
	className?: string;
}

const CallToActionFullWidth = ({
	title,
	description,
	buttonText,
	onButtonClick,
	buttonDisabled,
	className,
}: CallToActionFullWidthProps) => {
	return (
		<Container fluid className={['bg-n75', className].filter(Boolean).join(' ')}>
			<Container className="py-16 py-lg-24">
				<Row>
					<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
						<h2 className="mb-6 text-center">{title}</h2>
						{description && <div className="mb-6 fs-large text-center">{description}</div>}
						{buttonText && (
							<div className="text-center">
								<Button
									variant="primary"
									className="me-1"
									onClick={onButtonClick}
									disabled={buttonDisabled}
								>
									{buttonText}
								</Button>
							</div>
						)}
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default CallToActionFullWidth;
