import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import Color from 'color';

import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	showLeftGradient: boolean;
	showRightGradient: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	connectWithSupportItem: {
		padding: '24px 0',
	},
	informationOuter: {
		display: 'flex',
		marginBottom: 16,
		alignItems: 'center',
	},
	imageOuter: {
		width: 72,
		height: 72,
		flexShrink: 0,
		marginRight: 20,
		backgroundColor: theme.colors.n500,
	},
	information: {
		'& h5': {
			marginBottom: 2,
		},
		'& p': {
			margin: 0,
		},
	},
	descriptionOuter: {
		marginBottom: 28,
	},
	buttonsOuter: {
		position: 'relative',
		'&:before, &:after': {
			top: 0,
			width: 16,
			bottom: 0,
			zIndex: 1,
			content: '""',
			display: 'block',
			position: 'absolute',
			transition: '200ms transform',
		},
		'&:before': {
			left: 0,
			transform: ({ showLeftGradient }: UseStylesProps) =>
				showLeftGradient ? 'translateX(0)' : 'translateX(-16px)',
			background: `linear-gradient(-90deg, ${Color(theme.colors.background).alpha(0).string()} 0%, ${Color(
				theme.colors.background
			)
				.alpha(1)
				.string()} 100%);`,
		},
		'&:after': {
			right: 0,
			transform: ({ showRightGradient }: UseStylesProps) =>
				showRightGradient ? 'translateX(0)' : 'translateX(16px)',
			background: `linear-gradient(90deg, ${Color(theme.colors.background).alpha(0).string()} 0%, ${Color(
				theme.colors.background
			)
				.alpha(1)
				.string()} 100%);`,
		},
	},
	scrollOuter: {
		overflowX: 'auto',
	},
	scrollInner: {
		display: 'inline-flex',
		'& button': {
			marginRight: 4,
			'&:last-child': {
				marginRight: 0,
			},
		},
	},
	linksOuter: {},
}));

interface ConnectWithSupportItemProps {
	title: string;
	subtitle: string;
	descriptionHtml: string;
	buttons: ButtonProps[];
}

const ConnectWithSupportItem = ({ title, subtitle, descriptionHtml, buttons }: ConnectWithSupportItemProps) => {
	const scrollOuterRef = useRef<HTMLDivElement>(null);
	const scrollInnerRef = useRef<HTMLDivElement>(null);
	const [showLeftGradient, setShowLeftGradient] = useState(false);
	const [showRightGradient, setShowRightGradient] = useState(false);

	const classes = useStyles({
		showLeftGradient,
		showRightGradient,
	});

	const determineGradientDisplayState = useCallback(() => {
		if (!scrollOuterRef.current || !scrollInnerRef.current) {
			return;
		}

		const containerWidth = scrollOuterRef.current.getBoundingClientRect().width;
		const contentWidth = scrollInnerRef.current.getBoundingClientRect().width;
		const scrollLeft = scrollOuterRef.current.scrollLeft;
		const scrollableDistance = contentWidth - containerWidth;

		if (scrollLeft > 0 && !showLeftGradient) {
			setShowLeftGradient(true);
		} else if (scrollLeft <= 0 && showLeftGradient) {
			setShowLeftGradient(false);
		}

		if (scrollLeft < scrollableDistance && !showRightGradient) {
			setShowRightGradient(true);
		} else if (scrollLeft >= scrollableDistance && showRightGradient) {
			setShowRightGradient(false);
		}
	}, [showLeftGradient, showRightGradient]);

	const handleButtonScroll = useCallback(() => {
		determineGradientDisplayState();
	}, [determineGradientDisplayState]);

	useEffect(() => {
		determineGradientDisplayState();
	}, [determineGradientDisplayState]);

	return (
		<div className={classes.connectWithSupportItem}>
			<div className={classes.informationOuter}>
				<div className={classes.imageOuter} />
				<div className={classes.information}>
					<h5>{title}</h5>
					<p>{subtitle}</p>
				</div>
			</div>
			<div className={classes.descriptionOuter}>
				<div
					dangerouslySetInnerHTML={{
						__html: descriptionHtml,
					}}
				/>
			</div>
			<div className={classes.buttonsOuter}>
				<div ref={scrollOuterRef} className={classes.scrollOuter} onScroll={handleButtonScroll}>
					<div ref={scrollInnerRef} className={classes.scrollInner}>
						{buttons.map(({ title, ...buttonProps }, buttonIndex) => (
							<Button key={buttonIndex} {...buttonProps}>
								{title}
							</Button>
						))}
					</div>
				</div>
			</div>
			<div className={classes.linksOuter}></div>
		</div>
	);
};

export default ConnectWithSupportItem;
