import classNames from 'classnames';
import React, { ReactNode, useEffect, useState } from 'react';
import { Card, Collapse, Form, FormCheckProps } from 'react-bootstrap';

interface ToggledInputProps extends FormCheckProps {
	detail?: ReactNode;
	hideChildren?: boolean;
}

const ToggledInput = ({ detail, hideChildren, className, children, ...formCheckProps }: ToggledInputProps) => {
	const [isExpanded, setIsExpanded] = useState(formCheckProps.checked);

	useEffect(() => {
		setIsExpanded(formCheckProps.checked);
	}, [formCheckProps.checked]);

	const radio = (
		<div className="d-flex justify-content-between">
			<Form.Check type="radio" {...formCheckProps} />

			{detail}
		</div>
	);

	return (
		<Card bsPrefix="form-card" className={className}>
			<Card.Header className={classNames({ collapsed: hideChildren || !isExpanded })}>{radio}</Card.Header>

			{!hideChildren && (
				<Collapse in={isExpanded}>
					<div>
						<Card.Body>{children}</Card.Body>
					</div>
				</Collapse>
			)}
		</Card>
	);
};

export default ToggledInput;
