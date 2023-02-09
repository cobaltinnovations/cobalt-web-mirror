import React from 'react';
import { Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';

import useFlags from '@/hooks/use-flags';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as FlagPrimary } from '@/assets/icons/flag-primary.svg';
import { ReactComponent as FlagSuccess } from '@/assets/icons/flag-success.svg';
import { ReactComponent as FlagWarning } from '@/assets/icons/flag-warning.svg';
import { ReactComponent as FlagDanger } from '@/assets/icons/flag-danger.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';

const useStyles = createUseThemedStyles((theme) => ({
	flagsOuter: {
		left: 48,
		bottom: 48,
		zIndex: 2,
		width: 400,
		position: 'fixed',
	},
	flag: {
		bottom: 0,
		width: '100%',
		borderRadius: 3,
		overflow: 'hidden',
		position: 'absolute',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n0,
		transition: 'opacity 200ms, transform 200ms',
		'&:nth-of-type(n+2)': {
			transform: 'translate(0, calc(100% + 16px))',
		},
		'&:nth-of-type(n+3)': {
			visibility: 'hidden',
			transform: 'translate(0, calc(200% + 32px))',
		},
	},
	flagBorder: {
		height: 8,
		backgroundColor: theme.colors.p500,
		'&.flag-border--primary': {
			backgroundColor: theme.colors.p500,
		},
		'&.flag-border--success': {
			backgroundColor: theme.colors.s500,
		},
		'&.flag-border--warning': {
			backgroundColor: theme.colors.w500,
		},
		'&.flag-border--danger': {
			backgroundColor: theme.colors.d500,
		},
	},
	flagInner: {
		display: 'flex',
		alignItems: 'flex-start',
		padding: '16px 20px 16px',
		'& .flag-button': {
			border: 0,
			marginRight: 8,
			borderRadius: 3,
			padding: '2px 8px',
			appearance: 'none',
			color: theme.colors.p500,
			backgroundColor: 'rgba(0, 0, 0, 0.08)',
			'&:hover': {
				backgroundColor: 'rgba(0, 0, 0, 0.04)',
			},
			'&:active': {
				backgroundColor: 'rgba(0, 0, 0, 0.12)',
			},
		},
	},
	iconOuter: {
		width: 24,
		flexShrink: 0,
		'& > svg': {
			top: -4,
			position: 'relative',
		},
	},
	closeButtonOuter: {
		width: 20,
		flexShrink: 0,
	},
	'@global': {
		'.flag-transition-enter': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
		'.flag-transition-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.flag-transition-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.flag-transition-exit-active': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
	},
}));

const Flags = () => {
	const classes = useStyles();
	const { flags, removeFlagByFlagId } = useFlags();

	return (
		<div className={classes.flagsOuter}>
			<TransitionGroup component={null} className="flag-transition-list">
				{flags.map((flag, flagIndex) => {
					return (
						<CSSTransition
							key={flag.flagId}
							nodeRef={flag.nodeRef}
							addEndListener={() => {
								return;
							}}
							classNames="flag-transition"
							timeout={200}
							mountOnEnter
							unmountOnExit
						>
							<div key={flag.flagId} ref={flag.nodeRef} className={classes.flag}>
								<div className={classNames(classes.flagBorder, `flag-border--${flag.variant}`)} />
								<div className={classes.flagInner}>
									<div className={classes.iconOuter}>
										{flag.variant === 'primary' && <FlagPrimary />}
										{flag.variant === 'success' && <FlagSuccess />}
										{flag.variant === 'warning' && <FlagWarning />}
										{flag.variant === 'danger' && <FlagDanger />}
									</div>
									<div className="px-4 flex-grow-1">
										<h6 className="mb-2">{flag.title}</h6>
										{flag.description && <p className="mb-3">{flag.description}</p>}
										<div>
											{flag.actions.map((action, actionIndex) => {
												return (
													<Button
														key={actionIndex}
														bsPrefix="flag-button"
														onClick={(event) => {
															if (action.onClick) {
																action.onClick(event);
															}

															removeFlagByFlagId(flag.flagId);
														}}
													>
														{action.title}
													</Button>
												);
											})}
										</div>
									</div>
									<div className={classes.closeButtonOuter}>
										{flagIndex === 0 && (
											<Button variant="link" className="p-0 text-gray">
												<CloseIcon
													width={20}
													height={20}
													onClick={() => {
														removeFlagByFlagId(flag.flagId);
													}}
												/>
											</Button>
										)}
									</div>
								</div>
							</div>
						</CSSTransition>
					);
				})}
			</TransitionGroup>
		</div>
	);
};

export default Flags;
