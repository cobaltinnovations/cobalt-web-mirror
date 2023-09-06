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
	descriptionHTML: string;
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
	descriptionHTML,
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

				<div
					className="text-white mb-10"
					dangerouslySetInnerHTML={{
						__html: descriptionHTML,
					}}
				/>

				<div className="d-flex flex-column d-md-block mt-auto">
					<Button className="align-self-md-start" variant="light" onClick={onPrimaryActionClick}>
						{primaryActionText}
					</Button>

					{secondaryActionText && (
						<Button className="mt-4 mt-md-0 ms-md-2 align-self-md-start" onClick={onSecondaryActionClick}>
							{secondaryActionText}
						</Button>
					)}
				</div>
			</Col>

			{imageUrl && (
				<Col xs={12} md={4} className="d-flex mt-12 mt-md-0">
					<img className="w-100 align-self-center" src={imageUrl} alt={heading} />
				</Col>
			)}
		</Row>
	);
};

export default CallToActionBlock;
