import { COLOR_IDS } from '@/lib/models';

export const getBackgroundClassForColorId = (colorId?: COLOR_IDS) => {
	switch (colorId) {
		case COLOR_IDS.BRAND_PRIMARY:
			return 'bg-p50';
		case COLOR_IDS.BRAND_ACCENT:
			return 'bg-a50';
		case COLOR_IDS.SEMANTIC_DANGER:
			return 'bg-d50';
		case COLOR_IDS.SEMANTIC_WARNING:
			return 'bg-w50';
		case COLOR_IDS.SEMANTIC_SUCCESS:
			return 'bg-s50';
		case COLOR_IDS.SEMANTIC_INFO:
			return 'bg-i50';
		case COLOR_IDS.NEUTRAL:
			return 'bg-n50';
		default:
			return 'bg-n75';
	}
};

export const getTextClassForColorId = (colorId: COLOR_IDS) => {
	switch (colorId) {
		case COLOR_IDS.BRAND_PRIMARY:
			return 'text-primary';
		case COLOR_IDS.BRAND_ACCENT:
			return 'text-secondary';
		case COLOR_IDS.SEMANTIC_DANGER:
			return 'text-danger';
		case COLOR_IDS.SEMANTIC_WARNING:
			return 'text-warning';
		case COLOR_IDS.SEMANTIC_SUCCESS:
			return 'text-success';
		case COLOR_IDS.SEMANTIC_INFO:
			return 'text-info';
		default:
			return 'text-gray';
	}
};
