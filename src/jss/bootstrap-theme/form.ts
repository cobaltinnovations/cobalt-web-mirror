import { CobaltTheme } from '@/jss/theme';

export const form = (theme: CobaltTheme) => {
	return {
		'.cobalt-form': {
			'&__label': {
				...theme.fonts.h3,
				marginBottom: 15,
				color: theme.colors.n900,
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
				color: theme.colors.n900,
				lineHeight: 'normal',
				...theme.fonts.bodyNormal,
				backgroundColor: theme.colors.n0,
				border: `1px solid ${theme.colors.border}`,
				'&:hover': {
					border: `1px solid ${theme.colors.p500}`,
				},
				'&:disabled': {
					backgroundColor: theme.colors.n300,
					'&:hover': {
						border: `1px solid ${theme.colors.n500}`,
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
				color: theme.colors.n900,
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
					display: 'none',
					'& + label': {
						...theme.fonts.h4,
						padding: '15px 20px 15px 60px',
						width: '100%',
						borderRadius: 500,
						cursor: 'pointer',
						position: 'relative',
						color: theme.colors.p500,
						...theme.fonts.headingBold,
						backgroundColor: theme.colors.n0,
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
						color: theme.colors.n0,
						backgroundColor: theme.colors.a500,
						'&:before': {
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundColor: theme.colors.n0,
							backgroundSize: '12.5px 8.75px',
							border: `2px solid ${theme.colors.n0}`,
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
						color: theme.colors.n0,
						backgroundColor: theme.colors.a500,
						border: `1px solid ${theme.colors.a500}`,
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
				'& input[type=checkbox], & input[type=radio]': {
					display: 'none',

					'& + label': {
						...theme.fonts.default,
						...theme.fonts.bodyNormal,
						padding: '6px 0 6px 30px',
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
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundColor: theme.colors.n0,
							border: `2px solid ${theme.colors.n300}`,
						},
					},
				},
				'& input[type=checkbox][disabled], & input[type=radio][disabled]': {
					'& + label': {
						cursor: 'not-allowed',
						opacity: 1,

						'&:before': {
							backgroundColor: `${theme.colors.n100} !important`,
							borderColor: `${theme.colors.n100} !important`,
						},
					},
				},
				'& input[type=checkbox]': {
					'& + label:before': {
						borderRadius: 4,
					},

					'&:checked, &:indeterminate': {
						'& + label:before': {
							backgroundColor: theme.colors.p500,
							borderColor: theme.colors.p500,
						},
					},

					'&:checked': {
						'& + label:before': {
							backgroundImage: 'url(/static/images/icon-checkmark-white.svg)',
						},
					},
					'&:indeterminate': {
						'& + label:before': {
							backgroundImage: 'url(/static/images/icon-minus-white.svg)',
						},
					},

					'&:hover': {
						'& + label:before': {
							backgroundColor: theme.colors.p50,
							border: `2px solid ${theme.colors.p100}`,
						},
						'&:checked, &:indeterminate': {
							'& + label:before': {
								backgroundColor: theme.colors.p300,
								borderColor: theme.colors.p300,
							},
						},
					},
				},
				'& input[type=radio]': {
					'& + label:before': {
						borderRadius: '50%',
					},

					'&:checked': {
						'& + label:before': {
							backgroundColor: theme.colors.n0,
							borderColor: theme.colors.p500,
							backgroundImage: 'url(/static/images/icon-radio-orange.svg)',
						},
					},

					'&:hover': {
						'& + label:before': {
							backgroundColor: theme.colors.p50,
							border: `2px solid ${theme.colors.p100}`,
						},
						'&:checked': {
							'& + label:before': {
								backgroundColor: theme.colors.n0,
								borderColor: theme.colors.p300,
							},
						},
					},
				},
			},
		},
	};
};
