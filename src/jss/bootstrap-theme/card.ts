import { CobaltTheme } from '@/jss/theme';

export const card = (theme: CobaltTheme) => {
	return {
		'.cobalt-card': {
			backgroundColor: theme.colors.n0,
			boxShadow: theme.elevation.e400,
			'&__header': {
				padding: '15px 30px',
				borderBottom: 0,
			},
			'&__title.h5': {
				margin: 0,
				...theme.fonts.large,
				...theme.fonts.headingBold,
				textTransform: 'lowercase',
			},
			'&__subtitle.h6': {
				margin: 0,
				...theme.fonts.small,
				...theme.fonts.bodyNormal,
				textTransform: 'lowercase',
				color: theme.colors.n500,
			},
			'&__body': {
				borderTop: `1px solid ${theme.colors.n100}`,
				padding: '15px 30px',
			},
		},
		'.ic-card': {
			borderRadius: 4,
			border: `1px solid ${theme.colors.border}`,
			'&--care-resource-location': {
				border: 0,
				'& .cobalt-card': {
					'&__body': {
						padding: 24,
						borderRadius: 8,
						backgroundColor: theme.colors.n75,
						border: `1px solid ${theme.colors.border}`,
					},
				},
			},
			'& .cobalt-card': {
				'&__header': {
					padding: '14px 16px',
					position: 'relative',
					borderTopLeftRadius: 4,
					borderTopRightRadius: 4,
					backgroundColor: theme.colors.n75,
					borderBottom: `1px solid ${theme.colors.border}`,
					'& .button-container': {
						right: 16,
						top: '50%',
						display: 'flex',
						position: 'absolute',
						alignItems: 'center',
						transform: 'translateY(-50%)',
					},
				},
				'&__title.h5': {
					margin: 0,
					...theme.fonts.default,
					...theme.fonts.bodyNormal,
					fontWeight: `500 !important`,
					textTransform: 'none',
				},
				'&__body': {
					borderTop: `0px solid ${theme.colors.n100}`,
					padding: '20px 16px',
					borderBottomLeftRadius: 4,
					borderBottomRightRadius: 4,
					backgroundColor: theme.colors.n0,
				},
			},
		},
		'.form-card': {
			borderRadius: 4,
			border: `1px solid ${theme.colors.border}`,
			'& .cobalt-card': {
				'&__header': {
					padding: 16,
					position: 'relative',
					borderTopLeftRadius: 4,
					borderTopRightRadius: 4,
					backgroundColor: theme.colors.n0,
					borderBottom: `1px solid ${theme.colors.border}`,
					'&.collapsed': {
						borderRadius: 4,
						borderBottom: 'none',
					},
				},
				'&__body': {
					borderTop: `1px solid ${theme.colors.n100}`,
					padding: 16,
					borderBottomLeftRadius: 4,
					borderBottomRightRadius: 4,
					backgroundColor: theme.colors.n0,
					'&.no-header': {
						borderRadius: 4,
					},
				},
			},
		},
		'.table-card': {
			boxShadow: theme.elevation.e200,
			border: 0,
			borderRadius: 8,
			'& .cobalt-card': {
				'&__header': {
					padding: 20,
					borderTopLeftRadius: 8,
					borderTopRightRadius: 8,
					backgroundColor: theme.colors.n0,
					border: `1px solid ${theme.colors.n100}`,
					borderBottom: 0,
				},
				'&__body': {
					borderTop: 0,
					padding: 0,
					'& > div': {
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						borderBottomLeftRadius: 8,
						borderBottomRightRadius: 8,
						'& tr': {
							'& td': {
								border: `1px solid ${theme.colors.n100}`,
								'&:first-of-type': {
									borderLeft: 0,
								},
								'&:last-of-type': {
									borderRight: 0,
								},
							},
							'&:first-of-type': {
								'& td': {
									borderTop: 0,
								},
							},
							'&:last-of-type': {
								'& td': {
									borderBottom: 0,
								},
							},
						},
					},
				},
			},
		},
		'.analytics-card': {
			boxShadow: theme.elevation.e200,
			border: `1px solid ${theme.colors.n100}`,
			borderRadius: 12,
			backgroundColor: theme.colors.n0,
			'& .cobalt-card': {
				'&__header': {
					padding: '20px 32px',
					borderBottom: 0,
				},
				'&__body': {
					borderTop: `1px solid ${theme.colors.n100}`,
					padding: '20px 32px',
				},
			},
		},
	};
};
