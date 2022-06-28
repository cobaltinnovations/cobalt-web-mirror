import { createUseThemedStyles } from '@/jss/theme';

export const useSchedulingStyles = createUseThemedStyles((theme) => ({
	roundBtn: {
		width: 36,
		height: 36,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		border: `2px solid ${theme.colors.primary}`,
		backgroundColor: 'transparent',
		'& path': {
			fill: theme.colors.primary,
		},
	},
	roundBtnSolid: {
		width: 36,
		height: 36,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		backgroundColor: theme.colors.primary,
		'& path': {
			fill: theme.colors.white,
		},
	},
}));

export const useContainerStyles = createUseThemedStyles((theme) => ({
	wrapper: {
		display: 'flex',
		height: 'calc(100vh - 60px)', // subtracting header + footer height
	},
	sideBar: {
		width: 440,
		flexShrink: 0,
		backgroundColor: theme.colors.white,
		overflowX: 'scroll',
	},
	blockedTimeslot: {
		background: `repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 9px,
			${theme.colors.black} 10px,
			${theme.colors.black} 11px
		) !important;`,
	},
	leftCalendar: {
		'& .fc .fc-toolbar.fc-header-toolbar': {
			marginBottom: 12,
			'& .fc-toolbar-chunk': {
				display: 'flex',
				alignItems: 'center',
				'& .fc-toolbar-title': {
					...theme.fonts.m,
				},
				'& button.fc-prev-button, & button.fc-next-button': {
					margin: 0,
					border: 0,
					width: 32,
					height: 32,
					padding: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: 'transparent',
					'& .fc-icon': {
						color: theme.colors.dark,
					},
				},
				'& button.fc-prev-button': {
					marginLeft: 8,
				},
				'& button.fc-today-button': {
					...theme.fonts.xs,
					borderRadius: 500,
					padding: '4px 12px',
					color: theme.colors.primary,
					backgroundColor: 'transparent',
					border: `1px solid ${theme.colors.gray200}`,
				},
			},
		},
		'& .fc-theme-standard .fc-scrollgrid': {
			border: 0,
		},
		'& .fc-theme-standard td, .fc-theme-standard th': {
			border: 0,
			'& a:not([href])': {
				...theme.fonts.xs,
				color: theme.colors.gray600,
			},
		},
		'& .fc .fc-daygrid-day-bg .fc-bg-event': {
			borderRadius: 50,
		},
		'& .fc .fc-daygrid-day': {
			'& .fc-daygrid-day-frame': {
				width: 45,
				height: 45,
				display: 'flex',
				borderRadius: '50%',
				alignItems: 'center',
				flexDirection: 'column',
				justifyContent: 'center',
				margin: '0 auto',
			},
			'& .fc-daygrid-day-number': {
				padding: 0,
				marginTop: -4,
				color: theme.colors.dark,
			},
			'& .fc-daygrid-day-events': {
				width: 6,
				height: 6,
				margin: 0,
				minHeight: 0,
				flexShrink: 0,
				borderRadius: '50%',
				position: 'relative',
				border: `1px solid ${theme.colors.gray600}`,
				'& .fc-daygrid-event-harness': {
					width: 6,
					height: 6,
					top: -1,
					left: -1,
					borderRadius: '50%',
					position: 'relative',
					backgroundColor: theme.colors.primary,
					'& .fc-daygrid-event': {
						display: 'none',
					},
				},
				'& .fc-daygrid-event-harness:not(:first-of-type)': {
					display: 'none',
				},
			},
			'&.fc-day-today': {
				backgroundColor: 'transparent',
				'& .fc-daygrid-day-frame': {
					backgroundColor: theme.colors.secondary,
				},
				'& .fc-daygrid-day-number': {
					color: theme.colors.white,
				},
				'& .fc-daygrid-day-events': {
					border: `1px solid ${theme.colors.white}`,
					'& .fc-daygrid-event-harness': {
						backgroundColor: theme.colors.white,
					},
				},
			},
		},
	},
	mainCalendar: {
		flex: 1,
		height: '100%',
		'& .fc': {
			'& .fc-col-header-cell-cushion': {
				...theme.fonts.s,
				color: theme.colors.dark,
				padding: '9px 7px',
			},
			'& .fc-daygrid-day-events': {
				margin: 0,
			},
			'& .fc-daygrid-body-natural .fc-daygrid-day-events': {
				margin: 0,
			},
			'& .fc-daygrid-event-harness > a': {
				margin: 0,
				borderRadius: 0,
				padding: '6px 7px',
			},
			'& .fc-daygrid-day.fc-day-today, & .fc-timegrid-col.fc-day-today': {
				backgroundColor: '#F1E7DF',
			},
			'& .fc-timegrid-divider': {
				padding: 0,
				borderColor: theme.colors.dark,
			},
			'& .fc-timegrid-slot': {
				height: 48,
			},
			'& .fc-timegrid-slot-label': {
				verticalAlign: 'top',
			},
			'& .fc-timegrid-slot-label-cushion': {
				...theme.fonts.xxxs,
				color: theme.colors.gray600,
				padding: '4px 4px 0 0',
			},
			'& .fc-bg-event': {
				// backgroundColor: theme.colors.white,
			},
			'& .fc-timegrid-now-indicator-arrow': {
				display: 'none',
			},
			'& .fc-timegrid-now-indicator-line': {
				borderColor: theme.colors.primary,
				'&:before': {
					top: -4,
					left: 0,
					width: 7,
					height: 7,
					content: '""',
					borderRadius: '50%',
					position: 'absolute',
					backgroundColor: theme.colors.primary,
				},
			},
			'& .fc-timegrid-event': {
				marginBottom: 0,
				overflow: 'hidden',
			},
			'& .fc-timegrid-event, .fc-timegrid-more-link': {
				borderRadius: 0,
			},
			'& .fc-timegrid-event .fc-event-main': {
				padding: '7px 11px',
			},
			'& .fc-timegrid-event-harness-inset .fc-timegrid-event': {
				boxShadow: 'none',
			},
		},
	},
	eventText: {
		margin: 0,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
}));
