import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

interface useStylesProps {
	count: number;
}

const useStyles = createUseThemedStyles((theme) => ({
	pathways: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 -16px',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			margin: '0',
			display: 'block',
		},
	},
	pathwayOuter: ({ count }: useStylesProps) => ({
		width: `${(1 / count) * 100}%`,
		padding: '0 16px',
		marginBottom: 32,
		[mediaQueries.xl]: {
			width: '25%',
			marginBottom: 36,
		},
		[mediaQueries.lg]: {
			padding: '0',
			width: '100%',
			marginBottom: 16,
		},
	}),
	pathway: {
		zIndex: 0,
		height: '100%',
		borderRadius: 8,
		display: 'block',
		padding: '32px 24px',
		position: 'relative',
		textDecoration: 'none',
		color: theme.colors.n900,
		backgroundColor: theme.colors.n75,
		border: `1px solid ${theme.colors.n100}`,
		'&.recommended': {
			'&:before': {
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 2,
				height: 16,
				content: '""',
				position: 'absolute',
				borderBottomLeftRadius: 6,
				borderBottomRightRadius: 6,
				backgroundColor: 'inherit',
				[mediaQueries.lg]: {
					display: 'none',
				},
			},
			'&:after': {
				top: -3,
				left: -3,
				right: -3,
				bottom: -32,
				zIndex: 1,
				content: '""',
				borderRadius: 8,
				position: 'absolute',
				border: `3px solid ${theme.colors.p300}`,
				borderBottomWidth: 40,
				[mediaQueries.lg]: {
					bottom: -3,
					borderBottomWidth: 3,
				},
			},
		},
		[mediaQueries.lg]: {
			display: 'flex',
			padding: '16px 20px',
			alignItems: 'center',
		},
	},
	iconOuter: {
		width: '100%',
		display: 'flex',
		marginBottom: 32,
		borderRadius: '50%',
		position: 'relative',
		paddingBottom: '100%',
		backgroundColor: theme.colors.n0,
		'&:after': {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			content: '""',
			borderRadius: '50%',
			position: 'absolute',
			pointerEvents: 'none',
			border: `2px solid ${theme.colors.a500}`,
		},
		[mediaQueries.lg]: {
			width: 48,
			height: 48,
			padding: 0,
			marginRight: 20,
			marginBottom: 0,
		},
	},
	recommended: {
		left: 0,
		right: 0,
		zIndex: 2,
		height: 32,
		bottom: -32,
		display: 'flex',
		position: 'absolute',
		alignItems: 'center',
		color: theme.colors.n0,
		justifyContent: 'center',
		...theme.fonts.small,
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
}));

interface PathwaysSectionProps {
	className?: string;
}

const PathwaysSection = ({ className }: PathwaysSectionProps) => {
	const { institution } = useAccount();
	const classes = useStyles({
		count: (institution?.features ?? []).length,
	});

	return (
		<Container className={className}>
			<Row>
				<Col>
					<div className={classes.pathways}>
						{(institution?.features ?? []).map((feature, featureIndex) => (
							<div key={feature.featureId} className={classes.pathwayOuter}>
								<Link
									to={feature.urlName}
									className={classNames(classes.pathway, {
										recommended: featureIndex % 2 === 0,
									})}
								>
									<div className={classes.iconOuter}></div>
									<h5 className="text-center">{feature.name}</h5>
									{featureIndex % 2 === 0 && <div className={classes.recommended}>Recommended</div>}
								</Link>
							</div>
						))}
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default PathwaysSection;
