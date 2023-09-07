import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	container: {
		borderRadius: 24,
	},
	htmlContent: {
		'& p:last-of-type': {
			marginBottom: 0,
		},
	},
	subheading: {
		color: theme.colors.p100,
	},
}));

interface CallToActionBlockProps {
	heading: string;
	descriptionHtml: string;
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
	descriptionHtml,
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
		<div className={classNames(className, classes.container, 'bg-primary px-6 py-10 px-lg-16 py-lg-16')}>
			<Row>
				<Col xs={12} md={8} lg={7} className="d-flex flex-column">
					{subheading && <p className={classes.subheading}>{subheading}</p>}

					<h1 className="text-white my-4">{heading}</h1>

					<div
						className={classNames(classes.htmlContent, 'text-white mb-10')}
						dangerouslySetInnerHTML={{
							__html: descriptionHtml,
						}}
					/>

					<div className="d-flex flex-column d-lg-block mt-auto">
						<Button className="align-self-lg-start" variant="light" onClick={onPrimaryActionClick}>
							{primaryActionText}
						</Button>

						{secondaryActionText && (
							<Button
								className="mt-4 mt-lg-0 ms-lg-2 align-self-lg-start"
								onClick={onSecondaryActionClick}
							>
								{secondaryActionText}
							</Button>
						)}
					</div>
				</Col>

				{imageUrl && (
					<Col xs={12} md={4} lg={{ span: 4, offset: 1 }} className="d-flex mt-12 mt-md-0">
						<img className="w-100 align-self-center" src={imageUrl} alt={heading} />
					</Col>
				)}
			</Row>
		</div>
	);
};

export default CallToActionBlock;
