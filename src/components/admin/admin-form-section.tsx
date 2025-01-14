import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

export interface AdminFormSectionProps {
	title: string | ReactNode;
	description?: string | ReactNode;
	children: ReactNode;
	alignHorizontally?: boolean;
}

export const AdminFormSection = ({ title, description, children, alignHorizontally }: AdminFormSectionProps) => {
	return (
		<Row className={classNames('py-10', { 'align-items-center': alignHorizontally })}>
			<Col xs={12} lg={6}>
				{typeof title === 'string' ? <h4 className="mb-4">{title}</h4> : title}

				{typeof description === 'string' ? <p className="mb-0">{description}</p> : description}
			</Col>
			<Col xs={12} lg={6}>
				{children}
			</Col>
		</Row>
	);
};
