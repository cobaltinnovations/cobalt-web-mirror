import { useMemo } from 'react';

import greenPlaceholder from '@/assets/images/cobalt_greendefault.png';
import navyPlaceholder from '@/assets/images/cobalt_navydefault.png';
import orangePlaceholder from '@/assets/images/cobalt_orangedefault.png';
import tealPlaceholder from '@/assets/images/cobalt_tealdefault.png';

const placeholders = [greenPlaceholder, navyPlaceholder, orangePlaceholder, tealPlaceholder];

export const getRandomPlaceholderImage = () => {
	return Math.floor(Math.random() * placeholders.length);
};

function useRandomPlaceholderImage() {
	const randomIdx = useMemo(() => Math.floor(Math.random() * placeholders.length), []);

	return placeholders[randomIdx];
}

export default useRandomPlaceholderImage;
