import { debounce, type DebouncedFunc } from 'lodash';
import { useRef } from 'react';

function useDebouncedAsyncFunction<TArgs extends unknown[], TResult>(
	asyncFunction: (...args: TArgs) => Promise<TResult>,
	wait = 500
): DebouncedFunc<(...args: TArgs) => Promise<TResult>> {
	const debouncedFunction = useRef<DebouncedFunc<(...args: TArgs) => Promise<TResult>>>(
		debounce(async (...args: TArgs) => {
			return asyncFunction(...args);
		}, wait)
	);

	return debouncedFunction.current;
}

export default useDebouncedAsyncFunction;
