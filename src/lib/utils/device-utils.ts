export const isIos = () => {
	// @ts-ignore
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export const addMaximumScaleToViewportMetaTag = () => {
	const viewportMetaTag = document.querySelector('meta[name=viewport]');

	if (!viewportMetaTag) {
		return;
	}

	const maximumScaleRegex = /maximum-scale=[0-9.]+/g;
	let contentAttribute = viewportMetaTag.getAttribute('content') ?? '';

	if (maximumScaleRegex.test(contentAttribute)) {
		contentAttribute = contentAttribute.replace(maximumScaleRegex, 'maximum-scale=1.0');
	} else {
		contentAttribute = [contentAttribute, 'maximum-scale=1.0'].join(', ');
	}

	viewportMetaTag.setAttribute('content', contentAttribute);
};
