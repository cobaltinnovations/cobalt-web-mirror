import { CobaltTheme } from '@/jss/theme';

export const badge = (theme: CobaltTheme) => {
	return {
		'.cobalt-badge': {
			padding: '5px 10px',
			...theme.fonts.small,
			...theme.fonts.bodyNormal,
			'&.bg-primary': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.p500,
			},
			'&.bg-secondary': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.a500,
			},
			'&.bg-success': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.s500,
			},
			'&.bg-danger': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.d500,
			},
			'&.bg-warning': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.w500,
			},
			'&.bg-dark': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.n500,
			},
			'&.bg-light': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.n0,
			},
			'&.bg-outline-primary': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.p50,
				border: `1px solid ${theme.colors.p300}`,
			},
			'&.bg-outline-secondary': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.a50,
				border: `1px solid ${theme.colors.a300}`,
			},
			'&.bg-outline-success': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.s50,
				border: `1px solid ${theme.colors.s300}`,
			},
			'&.bg-outline-danger': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.d50,
				border: `1px solid ${theme.colors.d300}`,
			},
			'&.bg-outline-warning': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.w50,
				border: `1px solid ${theme.colors.w300}`,
			},
			'&.bg-outline-dark': {
				color: theme.colors.n500,
				backgroundColor: theme.colors.n50,
				border: `1px solid ${theme.colors.border}`,
			},
			'&.bg-outline-light': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.n0,
				border: `1px solid ${theme.colors.n500}`,
			},
		},
	};
};
