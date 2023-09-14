// Media queries as defined by react-bootstrap 1.0.0-beta.17
// https://react-bootstrap.github.io/layout/grid/

export const screenWidths = {
	xs: 575,
	sm: 576,
	md: 768,
	lg: 992,
	xl: 1200,
	xxl: 1400,
};

export const mediaQueries = {
	xs: `@media(max-width: ${screenWidths.xs}px)`,
	sm: `@media(max-width: ${screenWidths.sm}px)`,
	md: `@media(max-width: ${screenWidths.md}px)`,
	lg: `@media(max-width: ${screenWidths.lg}px)`,
	xl: `@media(max-width: ${screenWidths.xl}px)`,
	xxl: `@media(max-width: ${screenWidths.xxl}px)`,
};

export default mediaQueries;
