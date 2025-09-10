import { CobaltTheme } from '@/jss/theme';
import { maskImageSvg } from '@/components/svg-icon';

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
					border: 0,
					width: 20,
					height: 20,
					maskSize: 20,
					marginTop: 0,
					flexShrink: 0,
					borderRadius: 0,
					appearance: 'none',
					marginRight: '1rem',
					backgroundImage: 'none !important',
					backgroundColor: theme.colors.n100,

					'&:hover': {
						backgroundColor: theme.colors.n300,
					},

					'&:focus-visible': {
						backgroundColor: '#437DE8',
					},

					'&:disabled': {
						opacity: 1,
						backgroundColor: `${theme.colors.border} !important`,

						'& + label': {
							opacity: 1,
						},
					},

					'&:checked': {
						backgroundColor: theme.colors.p500,
						'&:hover': {
							backgroundColor: theme.colors.p300,
						},
						'&:focus-visible': {
							backgroundColor: '#437DE8',
						},
					},

					'&.is-invalid': {
						backgroundColor: `${theme.colors.d500} !important`,
						'&:disabled': {
							backgroundColor: `${theme.colors.d500} !important`,
						},
						'& + label': {
							color: theme.colors.n900,
						},
					},

					'& + label': {
						...theme.fonts.default,
						...theme.fonts.bodyNormal,
						cursor: 'pointer',
					},
				},
				'& input[type=checkbox]': {
					maskImage: maskImageSvg({ kit: 'far', icon: 'square' }),

					'&:checked': {
						maskImage: maskImageSvg({ kit: 'fas', icon: 'square-check' }),
					},

					'&:indeterminate': {
						backgroundColor: theme.colors.p500,
						maskImage: maskImageSvg({ kit: 'fas', icon: 'square-minus' }),
						'&:hover': {
							backgroundColor: theme.colors.p300,
						},
					},
				},
				'& input[type=radio]': {
					maskImage: maskImageSvg({ kit: 'far', icon: 'circle' }),

					'&:checked': {
						maskImage: maskImageSvg({ kit: 'fas', icon: 'circle-dot' }),
					},
				},
				'&--pill': {
					'&-inline': {
						marginRight: 8,
						marginBottom: 8,
						display: 'inline-block',
					},
					'& input': {
						width: 0,
						height: 0,
						display: 'none',
						appearance: 'none',
						'& + label': {
							display: 'flex',
							cursor: 'pointer',
							borderRadius: 500,
							alignItems: 'center',
							...theme.fonts.small,
							...theme.fonts.bodyBold,
							color: theme.colors.p500,
							padding: '6px 16px 6px 12px',
							border: `2px solid ${theme.colors.p500}`,
							'&:before': {
								width: 20,
								height: 20,
								maskSize: 20,
								content: '""',
								marginRight: 4,
								display: 'inline-flex',
								maskPosition: 'center',
								maskRepeat: 'no-repeat',
								maskImage: maskImageSvg({ kit: 'fas', icon: 'plus' }),
								backgroundColor: theme.colors.p500,
							},
						},
						'&:checked + label': {
							color: theme.colors.n0,
							backgroundColor: theme.colors.p700,
							'&:before': {
								backgroundColor: theme.colors.n0,
								maskImage: maskImageSvg({ kit: 'fas', icon: 'check' }),
							},
						},
					},
				},

				'&.no-label': {
					padding: 0,
					'& input': {
						margin: 0,
					},
				},

				'&.form-switch': {
					alignItems: 'start',
					'& .form-check-input': {
						marginLeft: 0,
						maskImage: `${maskImageSvg({ kit: 'fas', icon: 'toggle-off' })} !important`,
						'&:checked': {
							maskImage: `${maskImageSvg({ kit: 'fas', icon: 'toggle-on' })} !important`,
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
