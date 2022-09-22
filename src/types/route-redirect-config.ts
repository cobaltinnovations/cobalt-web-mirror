export interface RouteRedirectConfig {
	fromPath: string;
	toPath: string;
	caseSensitive?: boolean;
	searchParams?: Record<string, string>;
}
