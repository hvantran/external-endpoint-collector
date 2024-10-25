import { PagingResult, RestClient, SnackbarMessage } from "./GenericConstants"

export const EXT_ENDPOINT_BACKEND_URL: string = `${process.env.REACT_APP_ENDPOINT_MANAGER_BACKEND_URL}/endpoint-collector-backend/endpoints`
export const ROOT_BREADCRUMB: string = 'Endpoints'
export const SAMPLE_ENDPOINT_DATA: { [id: string]: any } = {
    "application": "Endpoint collector 01",
    "taskName": "Collect data",
    "noAttemptTimes": 10000,
    "noParallelThread": 15,
    "extEndpoint": "<Targeting URL>",
    "extEndpointMethod": "POST",
    "extEndpointData": `{
        <POST DATA>
}`,
    "columnMetadata": `{
    "columnId": "column1", 
    "columnMetadata": [
        {"fieldPath": "random", "mappingColumnName":"column1"}, 
        {"fieldPath": "$.data.user_id", "mappingColumnName":"column2"}, 
        {"fieldPath": "$.data.access_token", "mappingColumnName":"column3"}, 
        {"fieldPath": "$.data.email", "mappingColumnName":"column4"},
        {"fieldPath": "$.data.time_created", "mappingColumnName":"column5"},
        {"fieldPath": "$.data.time_expired", "mappingColumnName":"column6"},
        {"fieldPath": "$.data.name", "mappingColumnName":"column7"},
        {"fieldPath": "$.data.access_token", "decryptFunctionName":"decryptJWTBase64", "mappingColumnName":"column10"}
    ]
}`,
    "generatorSaltLength": 10,
    "generatorSaltStartWith": "0392013890",
    "generatorStrategy": "SEQUENCE",
    "successCriteria": "user_id",
    "responseConsumerType": "DATABASE"
}


export interface ExtEndpointOverview {
    endpointId: number
    application: string
    taskName: string
    targetURL: string
    elapsedTime: string
    createdAt: string
    numberOfCompletedTasks: number
    numberOfResponses: number
    percentCompleted: number
    state: string
}

export interface StoredColumn {
    fieldPath: string
    mappingColumnName: string
    displayName: string
    decryptFunctionName: string
}

export interface OuputColumnMetadata {
    columnId: string,
    columnMetadata: Array<StoredColumn>
}

export interface ExtEndpointResponseOverview {
    id: number
    column1: string
    column2: string
    column3: string
    column4: string
    column5: string
    column6: string
    column7: string
    column8: string
    column9: string
    column10: string
}

export interface EndpointDetail {
      application: string
      taskName: string
      noAttemptTimes: number
      noParallelThread: number
      extEndpoint: string
      extEndpointMethod: string
      headers: string | undefined
      generatorSaltLength: number
      generatorSaltStartWith: string
      generatorStrategy: string
      successCriteria: string
      responseConsumerType: string
      executorServiceType: string
      extEndpointData: string | undefined
      columnMetadata: string
}
export interface PatchEndpointMetadata {
    state: 'ACTIVE' | 'PAUSED'
}

export interface ExtEndpointMetadata {
    input: InputMetadata
    filter: FilterMetadata
    output: OutputMetadata
}

export interface FilterMetadata {
    successCriteria: string
}

export interface OutputMetadata {
    responseConsumerType: string
}

export interface DataGeneratorInfoMeta {
    generatorSaltLength: number
    generatorSaltStartWith: string
    generatorStrategy: string
}

export interface RequestInfoMeta {
    extEndpoint: string
    method: string
    data?: string
    headers?: string
}
export interface RequestInfoMeta {
    extEndpoint: string
    method: string
    data?: string
}
export interface InputMetadata {
    application: string
    taskName: string
    noAttemptTimes: number
    noParallelThread: number
    requestInfo: RequestInfoMeta
    columnMetadata: string
    executorServiceType: string
    dataGeneratorInfo: DataGeneratorInfoMeta
}

export class EndpointBackendClient {
    static update = async(endpointId: number, endpointMetadata: PatchEndpointMetadata, restClient: RestClient) => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(endpointMetadata)
        };
  
        const targetURL = `${EXT_ENDPOINT_BACKEND_URL}/${endpointId}`;
        await restClient.sendRequest(requestOptions, targetURL, async () => {
            return { 'message': `Endpoint is ${endpointMetadata.state}`, key: new Date().getTime() } as SnackbarMessage;
        });
    }

    static create = async (endpointMetadata: ExtEndpointMetadata, restClient: RestClient) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(endpointMetadata)
        };
  
        const targetURL = `${EXT_ENDPOINT_BACKEND_URL}`;
        await restClient.sendRequest(requestOptions, targetURL, async () => {
            let message = `Endpoint collector ${endpointMetadata.input.application} is created`;
            return { 'message': message, key: new Date().getTime() } as SnackbarMessage;
        });
    }

    static deleteEndpointCollector = async (
        endpointId: number,
        restClient: RestClient,
        successCallback: () => void) => {

        const requestOptions = {
            method: "DELETE",
            headers: {
                "Accept": "application/json"
            }
        }

        const targetURL = `${EXT_ENDPOINT_BACKEND_URL}/${endpointId}`;
        await restClient.sendRequest(requestOptions, targetURL, () => {
            successCallback();
            return undefined;
        });
    }

    static loadEndpointSummaryAsync = async (
        pageIndex: number,
        pageSize: number,
        orderBy: string,
        restClient: RestClient,
        successCallback: (extEndpointPagingResult: PagingResult) => void) => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }

        const targetURL = `${EXT_ENDPOINT_BACKEND_URL}?pageIndex=${pageIndex}&pageSize=${pageSize}&orderBy=${orderBy}`;
        await restClient.sendRequest(requestOptions, targetURL, async (response) => {
            let extEndpointPagingResult = await response.json() as PagingResult;
            successCallback(extEndpointPagingResult);
            return { 'message': 'Load endpoints successfully!!', key: new Date().getTime() } as SnackbarMessage;
        });
    }

    static loadExternalEndpointSettingAsync = async (
        endpointId: number,
        restClient: RestClient,
        successCallback: (endpointMetadata: EndpointDetail) => void) => {

        const requestOptions = {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        }

        const targetURL = `${EXT_ENDPOINT_BACKEND_URL}/${endpointId}`;
        await restClient.sendRequest(requestOptions, targetURL, async (response) => {
            let endpointMetadata = await response.json() as ExtEndpointMetadata;
            let endpointInput: InputMetadata = endpointMetadata.input
            let endpointOutput: OutputMetadata = endpointMetadata.output
            let endpointFilter: FilterMetadata = endpointMetadata.filter
            let endpointDetailMetadata: EndpointDetail = {
                application: endpointInput.application,
                taskName: endpointInput.taskName,
                noAttemptTimes: endpointInput.noAttemptTimes,
                noParallelThread: endpointInput.noParallelThread,
                extEndpoint: endpointInput.requestInfo.extEndpoint,
                extEndpointMethod: endpointInput.requestInfo.method,
                generatorSaltLength: endpointInput.dataGeneratorInfo.generatorSaltLength,
                generatorSaltStartWith: endpointInput.dataGeneratorInfo.generatorSaltStartWith,
                generatorStrategy: endpointInput.dataGeneratorInfo.generatorStrategy,
                successCriteria: endpointFilter.successCriteria,
                responseConsumerType: endpointOutput.responseConsumerType,
                executorServiceType: endpointInput.executorServiceType,
                extEndpointData: endpointInput.requestInfo.data,
                columnMetadata: endpointInput.columnMetadata,
                headers: endpointInput.requestInfo.headers ? JSON.stringify(endpointInput.requestInfo.headers, null, 2) : undefined
            } 
            successCallback(endpointDetailMetadata);
            return { 'message': 'Load endpoint successfully!!', key: new Date().getTime() } as SnackbarMessage;
        });
    }

    static loadExternalEndpointResponseAsync = async (
        application: string,
        pageIndex: number,
        pageSize: number,
        orderBy: string,
        restClient: RestClient,
        successCallback: (extEndpointPagingResult: PagingResult) => void) => {

        const requestOptions = {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        }

        const targetURL = `${EXT_ENDPOINT_BACKEND_URL}/${application}/responses?pageIndex=${pageIndex}&pageSize=${pageSize}&orderBy=${orderBy}`;
        await restClient.sendRequest(requestOptions, targetURL, async (response) => {
            let extEndpointPagingResult = await response.json() as PagingResult;
            successCallback(extEndpointPagingResult)
            return undefined;
        });
    }
}