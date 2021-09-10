import { useEffect, useContext, ReactElement } from 'react';
import { HeaderContext } from '@/contexts/header-context';

const useHeaderTitle = (title: ReactElement | string | null) => {
	const { resetTitle, setTitle } = useContext(HeaderContext);

	useEffect(() => {
		if (title === null) {
			resetTitle();
			return;
		}

		setTitle(title ? title : '');
	}, [resetTitle, setTitle, title]);
};

export default useHeaderTitle;
