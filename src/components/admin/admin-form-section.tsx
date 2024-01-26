import React, { ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

export interface AdminFormSectionProps {
	title: string | ReactNode;
	description?: string | ReactNode;
	children: ReactNode;
}

export const AdminFormSection = ({ title, description, children }: AdminFormSectionProps) => {
	return (
		<Row className="py-10">
			<Col xs={12} lg={6}>
				{typeof title === 'string' ? <h4 className="mb-4">{title}</h4> : title}

				{typeof description === 'string' ? <p>{description}</p> : description}
			</Col>

			<Col xs={12} lg={6}>
				{children}
			</Col>
		</Row>
	);
};
