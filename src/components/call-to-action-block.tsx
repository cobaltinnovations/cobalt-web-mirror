import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	container: {
		borderRadius: 24,
	},
	subheading: {
		color: theme.colors.p100,
	},
}));

interface CallToActionBlockProps {
	heading: string;
	description: string;
	imageUrl: string;
	primaryActionText: string;
	onPrimaryActionClick: () => void;
	subheading?: string;
	secondaryActionText?: string;
	onSecondaryActionClick?: () => void;
	className?: string;
}

const CallToActionBlock = ({
	heading,
	description,
	imageUrl,
	subheading,
	primaryActionText,
	secondaryActionText,
	onPrimaryActionClick,
	onSecondaryActionClick,
	className,
}: CallToActionBlockProps) => {
	const classes = useStyles();

	return (
		<Row className={classNames(className, classes.container, 'bg-primary p-16')}>
			<Col xs={12} md={8} className="d-flex flex-column">
				{subheading && <p className={classes.subheading}>{subheading}</p>}

				<h1 className="text-white my-4">{heading}</h1>

				<p className="text-white">{description}</p>

				<div className="mt-auto">
					<Button className="me-2" variant="light" onClick={onPrimaryActionClick}>
						{primaryActionText}
					</Button>

					{secondaryActionText && <Button onClick={onSecondaryActionClick}>{secondaryActionText}</Button>}
				</div>
			</Col>

			{imageUrl && (
				<Col xs={12} md={4}>
					<img src={imageUrl} alt={heading} />
				</Col>
			)}
		</Row>
	);
};

export default CallToActionBlock;
