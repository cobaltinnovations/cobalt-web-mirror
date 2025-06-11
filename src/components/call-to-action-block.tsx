import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

type variant = 'primary' | 'light';

interface UseStylesProps {
	variant?: variant;
}

const useStyles = createUseThemedStyles((theme) => ({
	container: {
		borderRadius: 24,
		boxShadow: theme.elevation.e400,
		backgroundColor: ({ variant }: UseStylesProps) => {
			switch (variant) {
				case 'light':
					return theme.colors.n75;
				default:
					return theme.colors.p500;
			}
		},
		'& h1': {
			color: ({ variant }: UseStylesProps) => {
				switch (variant) {
					case 'light':
						return theme.colors.n900;
					default:
						return theme.colors.n0;
				}
			},
		},
	},
	subheading: {
		color: ({ variant }: UseStylesProps) => {
			switch (variant) {
				case 'light':
					return theme.colors.n500;
				default:
					return theme.colors.p100;
			}
		},
	},
	htmlContent: {
		color: ({ variant }: UseStylesProps) => {
			switch (variant) {
				case 'light':
					return theme.colors.n700;
				default:
					return theme.colors.n0;
			}
		},
		'& p:last-of-type': {
			marginBottom: 0,
		},
	},
}));

interface CallToActionBlockProps {
	heading: string;
	descriptionHtml: string;
	imageUrl: string;
	primaryActionText?: string;
	onPrimaryActionClick?: () => void;
	subheading?: string;
	secondaryActionText?: string;
	onSecondaryActionClick?: () => void;
	className?: string;
	variant?: variant;
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
	variant,
}: CallToActionBlockProps) => {
	const classes = useStyles({
		variant,
	});

	return (
		<div className={classNames(className, classes.container, 'px-6 py-10 px-lg-16 py-lg-16')}>
			<Row>
				<Col xs={12} md={8} lg={7} className="d-flex flex-column">
					{subheading && <p className={classes.subheading}>{subheading}</p>}

					<h1 className="my-4">{heading}</h1>

					<div
						className={classNames(classes.htmlContent, {
							'mb-10': primaryActionText || secondaryActionText,
						})}
						dangerouslySetInnerHTML={{
							__html: descriptionHtml,
						}}
					/>

					{(primaryActionText || secondaryActionText) && (
						<div className="d-flex flex-column d-lg-block mt-auto">
							{primaryActionText && (
								<Button
									className="align-self-lg-start"
									variant={variant === 'light' ? 'primary' : 'light'}
									onClick={onPrimaryActionClick}
								>
									{primaryActionText}
								</Button>
							)}
							{secondaryActionText && (
								<Button
									className="mt-4 mt-lg-0 ms-lg-2 align-self-lg-start"
									variant={variant === 'light' ? 'outline-primary' : 'primary'}
									onClick={onSecondaryActionClick}
								>
									{secondaryActionText}
								</Button>
							)}
						</div>
					)}
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
