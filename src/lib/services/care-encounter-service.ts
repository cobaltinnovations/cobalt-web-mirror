import { CareEncounterModel, CareEncounterSortColumnId, CareEncounterStatusId, SortDirectionId } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';

export interface GetCareEncountersQueryParameters {
	pageNumber?: number;
	pageSize?: number;
	startDate?: string;
	endDate?: string;
	searchQuery?: string;
	careEncounterStatusId?: CareEncounterStatusId;
	careEncounterSortColumnId?: CareEncounterSortColumnId;
	sortDirectionId?: SortDirectionId;
}

export interface GetCareEncountersResponseBody {
	totalCount: number;
	totalCountDescription: string;
	careEncounters: CareEncounterModel[];
}

export interface GetCareEncounterResponseBody {
	careEncounter: CareEncounterModel;
	otherCareEncounters: CareEncounterModel[];
	otherCareEncountersTotalCount: number;
	otherCareEncountersTotalCountDescription: string;
}

export const careEncounterService = {
	getCareEncounters(queryParameters?: GetCareEncountersQueryParameters) {
		return httpSingleton.orchestrateRequest<GetCareEncountersResponseBody>({
			method: 'get',
			url: buildQueryParamUrl('/admin/care-encounters', queryParameters),
		});
	},
	getCareEncounter(careEncounterId: string) {
		return httpSingleton.orchestrateRequest<GetCareEncounterResponseBody>({
			method: 'get',
			url: `/admin/care-encounters/${careEncounterId}`,
		});
	},
};
