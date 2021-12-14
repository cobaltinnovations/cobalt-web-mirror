import { ErrorConfig } from '@/lib/http-client';

export function isErrorConfig(error: ErrorConfig | unknown): error is ErrorConfig {
	return (error as ErrorConfig).code !== undefined && (error as ErrorConfig).message !== undefined;
}
