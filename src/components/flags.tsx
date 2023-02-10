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

interface UseStylesProps {
	removalDurationInMs: number;
}

const useStyles = createUseThemedStyles((theme) => ({
	flagsOuter: {
		left: 48,
		bottom: 48,
		zIndex: 2,
		width: 400,
		position: 'fixed',
		'& .flag': {
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
			'&:first-of-type .flag-border': {
				animation: ({ removalDurationInMs }: UseStylesProps) =>
					`$flag-border-width ${removalDurationInMs}ms linear 0ms normal forwards`,
			},
			'&--primary': {
				'& .flag-border-outer': {
					backgroundColor: theme.colors.p100,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.p500,
				},
				'& .icon-outer': {
					color: theme.colors.p500,
				},
				'& .close-button-outer button': {
					color: theme.colors.n500,
				},
			},
			'&--success': {
				'& .flag-border-outer': {
					backgroundColor: theme.colors.s100,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.s500,
				},
				'& .icon-outer': {
					color: theme.colors.s500,
				},
				'& .close-button-outer button': {
					color: theme.colors.n500,
				},
			},
			'&--warning': {
				'& .flag-border-outer': {
					backgroundColor: theme.colors.w100,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.w500,
				},
				'& .icon-outer': {
					color: theme.colors.w500,
				},
				'& .close-button-outer button': {
					color: theme.colors.n500,
				},
			},
			'&--danger': {
				'& .flag-border-outer': {
					backgroundColor: theme.colors.d100,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.d500,
				},
				'& .icon-outer': {
					color: theme.colors.d500,
				},
				'& .close-button-outer button': {
					color: theme.colors.n500,
				},
			},
			'&--bold-primary': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.p500,
				'& .flag-border-outer': {
					backgroundColor: theme.colors.p300,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.p500,
				},
				'& .flag-button, & .close-button-outer button': {
					color: theme.colors.n0,
				},
			},
			'&--bold-success': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.s500,
				'& .flag-border-outer': {
					backgroundColor: theme.colors.s300,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.s500,
				},
				'& .flag-button, & .close-button-outer button': {
					color: theme.colors.n0,
				},
			},
			'&--bold-warning': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.w500,
				'& .flag-border-outer': {
					backgroundColor: theme.colors.w300,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.w500,
				},
				'& .flag-button, & .close-button-outer button': {
					color: theme.colors.n900,
				},
			},
			'&--bold-danger': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.d500,
				'& .flag-border-outer': {
					backgroundColor: theme.colors.d300,
				},
				'& .flag-border': {
					backgroundColor: theme.colors.d500,
				},
				'& .flag-button, & .close-button-outer button': {
					color: theme.colors.n0,
				},
			},
		},
		'& .flag-border-outer': {
			height: 8,
			width: '100%',
			backgroundColor: theme.colors.n100,
		},
		'& .flag-border': {
			width: '100%',
			height: '100%',
			backgroundColor: theme.colors.n500,
		},
		'& .flag-inner': {
			display: 'flex',
			alignItems: 'flex-start',
			padding: '20px 20px 16px',
			'& .icon-outer': {
				width: 24,
				flexShrink: 0,
				'& > svg': {
					top: -4,
					position: 'relative',
				},
			},
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
			'& .close-button-outer': {
				width: 20,
				flexShrink: 0,
			},
		},
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
	'@keyframes flag-border-width': {
		'0%': {
			width: '100%',
		},
		'100%': {
			width: '0%',
		},
	},
}));

const Flags = () => {
	const { flags, removeFlagByFlagId, removalDurationInMs } = useFlags();
	const classes = useStyles({ removalDurationInMs });

	return (
		<div className={classes.flagsOuter}>
			<TransitionGroup component={null} className="flag-outer-transition">
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
							<div
								key={flag.flagId}
								ref={flag.nodeRef}
								className={classNames('flag', `flag--${flag.variant}`)}
							>
								{!flag.variant.includes('bold') && (
									<div className="flag-border-outer">
										<div className="flag-border" />
									</div>
								)}
								<div className="flag-inner">
									<div className="icon-outer">
										{(flag.variant === 'primary' || flag.variant === 'bold-primary') && (
											<FlagPrimary />
										)}
										{(flag.variant === 'success' || flag.variant === 'bold-success') && (
											<FlagSuccess />
										)}
										{(flag.variant === 'warning' || flag.variant === 'bold-warning') && (
											<FlagWarning />
										)}
										{(flag.variant === 'danger' || flag.variant === 'bold-danger') && (
											<FlagDanger />
										)}
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
									<div className="close-button-outer">
										{flagIndex === 0 && (
											<Button variant="link" className="p-0">
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
