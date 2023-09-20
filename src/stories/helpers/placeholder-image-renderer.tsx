import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import React, { ReactNode } from 'react';

export const PlaceholderImageRenderer = ({ children }: { children: (placeholderImageUrl: string) => ReactNode }) => {
	const placeholderImageUrl = useRandomPlaceholderImage();

	return <>{children(placeholderImageUrl)}</>;
};
