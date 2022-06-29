import { CobaltTheme } from '@/jss/theme';

export const form = (theme: CobaltTheme) => {
	return {
		'.cobalt-form': {
			'&__label': {
				...theme.fonts.h3,
				marginBottom: 15,
				color: theme.colors.dark,
				...theme.fonts.headingBold,
			},
			'&__control': {
				flex: 1,
				padding: 0,
				...theme.fonts.default,
				width: '100%',
				textIndent: 15,
				borderRadius: 0,
				display: 'block',
				appearance: 'none',
				color: theme.colors.dark,
				lineHeight: 'normal',
				...theme.fonts.bodyNormal,
				backgroundColor: theme.colors.white,
				border: `1px solid ${theme.colors.border}`,
				'&:hover': {
					border: `1px solid ${theme.colors.primary}`,
				},
				'&:disabled': {
					backgroundColor: theme.colors.gray300,
					'&:hover': {
						border: `1px solid ${theme.colors.gray500}`,
					},
				},
				'&:focus': {
					outline: 'none',
				},
				'&[type=date], &[type=datetime-local], &[type=email], &[type=month], &[type=number], &[type=password], &[type=search], &[type=tel], &[type=text], &[type=time], &[type=url], &[type=week]':
					{
						height: 54,
						lineHeight: '5.4rem',
					},
				'&[type=date]': {
					textIndent: 0,
					paddingLeft: 15,
					paddingRight: 15,
				},
				'&[type=search]': {
					paddingRight: 15,
				},
			},
			'&__control-full': {
				flex: 1,
				border: 0,
				padding: 0,
				height: 70,
				...theme.fonts.default,
				width: '100%',
				borderRadius: 0,
				display: 'block',
				appearance: 'none',
				color: theme.colors.dark,
				lineHeight: 'normal',
				...theme.fonts.bodyNormal,
				backgroundColor: 'transparent',
				'&:focus': {
					outline: 'none',
				},
			},
			'&__check': {
				marginBottom: 5,
				'&-inline': {
					marginRight: 24,
					display: 'inline-flex',
				},
				'& input[type=checkbox], & input[type=radio]': {
					width: 0,
					height: 0,
					opacity: 0,
					'& + label': {
						...theme.fonts.h4,
						padding: '15px 20px 15px 60px',
						width: '100%',
						borderRadius: 500,
						cursor: 'pointer',
						position: 'relative',
						color: theme.colors.primary,
						...theme.fonts.headingBold,
						backgroundColor: theme.colors.white,
						'&:before': {
							left: 15,
							width: 25,
							height: 25,
							top: '50%',
							content: '""',
							borderRadius: '50%',
							position: 'absolute',
							transform: 'translateY(-50%)',
							border: `2px solid ${theme.colors.background}`,
						},
					},
					'&:checked + label': {
						color: theme.colors.white,
						backgroundColor: theme.colors.secondary,
						'&:before': {
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundColor: theme.colors.white,
							backgroundSize: '12.5px 8.75px',
							border: `2px solid ${theme.colors.white}`,
							backgroundImage: 'url(/static/images/icon-checkmark-orange.svg)',
						},
					},
				},
			},
		},
		'textarea.cobalt-form__control': {
			height: 260,
			padding: 15,
			textIndent: 0,
			resize: 'none',
		},
		'select.cobalt-form__control': {
			textIndent: 0,
		},
		'.input-group': {
			'& .input-group__radio > input + label': {
				borderRight: 0,
			},
			'& .input-group__radio:first-child > input + label': {
				borderTopLeftRadius: 500,
				borderBottomLeftRadius: 500,
			},
			'& .input-group__radio:last-child > input + label': {
				borderTopRightRadius: 500,
				borderBottomRightRadius: 500,
				border: `1px solid ${theme.colors.border}`,
			},
			'&__radio': {
				'& input': {
					display: 'none',
					'& + label': {
						padding: 16,
						backgroundColor: 'transparent',
						border: `1px solid ${theme.colors.border}`,
						...theme.fonts.small,
						...theme.fonts.bodyBold,
					},
					'&:checked + label': {
						color: theme.colors.white,
						backgroundColor: theme.colors.secondary,
						border: `1px solid ${theme.colors.secondary}`,
					},
				},
			},
		},
	};
};

export const modalForm = (theme: CobaltTheme) => {
	return {
		'.cobalt-modal-form': {
			'&__check': {
				'&-inline': {
					marginRight: 24,
					display: 'inline-flex',
				},
				'& input[type=checkbox]': {
					'& + label:before': {
						backgroundColor: theme.colors.secondary,
					},
					'&:checked + label': {
						'&:before': {
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundImage: 'url(/static/images/icon-checkmark-white.svg)',
						},
					},
				},
				'& input[type=radio]': {
					'& + label:before': {
						border: `2px solid ${theme.colors.secondary}`,
						padding: 2,
						borderRadius: '50%',
					},
					'&:checked + label:before': {
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						backgroundImage: 'url(/static/images/icon-radio-orange.svg)',
					},
				},
				'& input[type=checkbox], & input[type=radio]': {
					width: 0,
					height: 0,
					opacity: 0,
					'& + label': {
						...theme.fonts.default,
						...theme.fonts.bodyNormal,
						padding: '6px 0 6px 32px',
						width: '100%',
						cursor: 'pointer',
						position: 'relative',
						'&:before': {
							left: 0,
							width: 18,
							height: 18,
							top: '50%',
							content: '""',
							position: 'absolute',
							transform: 'translateY(-50%)',
						},
					},
				},
				'& input[type=checkbox][disabled], & input[type=radio][disabled]': {
					'& + label': {
						cursor: 'default',
						color: 'inherit',
						'&:before': {
							backgroundColor: theme.colors.gray300,
							backgroundImage: null,
							border: 'none',
						},
					},
				},
			},
		},
	};
};
