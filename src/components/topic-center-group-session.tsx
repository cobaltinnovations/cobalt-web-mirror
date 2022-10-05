import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	topicCenterGroupSession: {
		padding: 20,
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
		boxShadow: '0px 10px 18px rgba(41, 40, 39, 0.15), 0px 0px 1px rgba(41, 40, 39, 0.31)',
		[mediaQueries.lg]: {
			padding: 0,
			flexDirection: 'column',
		},
	},
	imageOuter: {
		width: 240,
		flexShrink: 0,
		borderRadius: 5,
		position: 'relative',
		backgroundColor: theme.colors.n300,
		'& .cobalt-badge': {
			right: 8,
			bottom: 8,
			position: 'absolute',
		},
		[mediaQueries.lg]: {
			height: 210,
			width: '100%',
			borderRadius: 0,
		},
	},
	informationOuter: {
		paddingLeft: 24,
		[mediaQueries.lg]: {
			padding: 20,
		},
	},
}));

interface Props {
	title: string;
	titleSecondary: string;
	titleTertiary?: string;
	description: string;
	badgeTitle?: string;
	buttonTitle: string;
	onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	className?: string;
}

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

export const TopicCenterGroupSession = ({
	title,
	titleSecondary,
	titleTertiary,
	description,
	badgeTitle,
	buttonTitle,
	onClick,
	className,
}: Props) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.topicCenterGroupSession, className)}>
			<div className={classes.imageOuter}>
				{badgeTitle && (
					<Badge className="d-lg-none" as="div" bg="outline-secondary" pill>
						{badgeTitle}
					</Badge>
				)}
			</div>
			<div className={classes.informationOuter}>
				<div className="mb-lg-4">
					<h3 className="mb-1">{title}</h3>
					<p className="mb-1 text-muted text-uppercase fw-bold">{titleSecondary}</p>
					{titleTertiary && <p className="mb-0 text-muted">{titleTertiary}</p>}
				</div>
				<ResponsiveEllipsis
					className="d-none d-lg-block mb-4"
					text={description}
					maxLine={titleTertiary ? '2' : '3'}
					component="p"
				/>
				<div className="d-none d-lg-flex justify-content-between align-items-end">
					<div>
						{badgeTitle && (
							<Badge as="div" bg="outline-secondary" pill>
								{badgeTitle}
							</Badge>
						)}
					</div>
					<Button size="sm" onClick={onClick}>
						{buttonTitle}
					</Button>
				</div>
			</div>
		</div>
	);
};
