export interface Chart {
	chartTypeId: string;
	displayPreferenceId: string;
	title: string;
	detail: string;
	elements: ChartElement[];
}

export interface ChartElement {
	description: string;
	startDate: string;
	startDateDescription: string;
	endDate: string;
	endDateDescription: string;
	metrics: ChartMetric[];
}

export interface ChartMetric {
	metricTypeId: string;
	description: string;
	count: number;
	countDescription: string;
	color: string;
	alpha: string;
}
