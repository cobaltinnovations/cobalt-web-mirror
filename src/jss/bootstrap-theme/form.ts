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
				padding: '0.5rem 0px',
				display: 'flex',
				alignItems: 'center',

				'&-inline': {
					marginRight: 24,
					display: 'inline-flex',
				},
				'& .form-check-input': {
					marginTop: 0,
					marginRight: '1rem',
					appearance: 'none',
					width: 20,
					height: 20,
					color: theme.colors.p500,
					backgroundColor: theme.colors.n0,
					border: `2px solid ${theme.colors.border}`,
					display: 'grid',
					placeContent: 'center',

					'&:before': {
						content: '""',
						borderRadius: '50%',
					},

					'&:focus,&:active': {
						boxShadow: 'none',
						borderColor: '#437DE8 !important',
					},

					'&:disabled': {
						opacity: 1,

						'& + label': {
							opacity: 1,
						},
					},

					'& + label': {
						...theme.fonts.default,
						...theme.fonts.bodyNormal,
						cursor: 'pointer',
					},
				},
				'& input[type=checkbox]': {
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundSize: '12px 12px',

					'&:hover': {
						borderColor: theme.colors.p100,
						backgroundColor: theme.colors.p50,
					},

					'&:disabled': {
						color: 'red',
						borderColor: `${theme.colors.n100} !important`,
						backgroundColor: `${theme.colors.n100} !important`,

						'&:checked': {
							backgroundImage: `url(${__PUBLIC_URL__}/static/images/icon-checkmark-dark.svg)`,
						},

						'&:indeterminate': {
							backgroundImage: `url(${__PUBLIC_URL__}/static/images/icon-minus-dark.svg)`,
						},
					},

					'&:checked,&:indeterminate': {
						borderColor: theme.colors.p500,
						backgroundColor: theme.colors.p500,

						'&:hover': {
							borderColor: theme.colors.p300,
							backgroundColor: theme.colors.p300,
						},
					},

					'&:checked': {
						backgroundImage: `url(${__PUBLIC_URL__}/static/images/icon-checkmark-white.svg)`,
					},

					'&:indeterminate': {
						backgroundImage: `url(${__PUBLIC_URL__}/static/images/icon-minus-white.svg)`,
					},

					'&.is-invalid': {
						borderColor: `${theme.colors.d500} !important`,

						'&:focus,&:active': {
							borderColor: '#437DE8 !important',
						},

						'& + label': {
							color: theme.colors.n900,
						},
					},
				},
				'& input[type=radio]': {
					backgroundImage: 'initial',

					'&:before': {
						width: 10,
						height: 10,
					},

					'&:hover': {
						borderColor: theme.colors.p300,
						backgroundColor: theme.colors.p50,
					},

					'&:disabled': {
						borderColor: `${theme.colors.n300} !important`,
						backgroundColor: `${theme.colors.n100} !important`,
					},

					'&:checked': {
						backgroundImage: 'initial',
						borderColor: theme.colors.p500,
						backgroundColor: theme.colors.n0,

						'&:before': {
							boxShadow: `inset 1em 1em ${theme.colors.p500}`,
						},

						'&:disabled': {
							'&:before': {
								boxShadow: `inset 1em 1em ${theme.colors.n500} !important`,
							},
						},

						'&:hover': {
							borderColor: theme.colors.p300,
							'&:before': {
								boxShadow: `inset 1em 1em ${theme.colors.p300}`,
							},
						},
					},

					'&.is-invalid': {
						borderColor: `${theme.colors.d500} !important`,
						'&:disabled': {
							borderColor: `${theme.colors.d500} !important`,
						},

						'& + label': {
							color: theme.colors.n900,
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

export const surveyForm = (theme: CobaltTheme) => {
	return {
		'.cobalt-survey-form': {
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
							backgroundImage: `url(${__PUBLIC_URL__}/static/images/icon-checkmark-orange.svg)`,
						},
					},
				},
			},
		},
	};
};
