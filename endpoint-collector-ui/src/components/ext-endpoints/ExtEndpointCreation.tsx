import { json } from '@codemirror/lang-json';
import { Stack } from '@mui/material';

import LinkBreadcrumd from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import { EndpointBackendClient, EndpointDetail, ExtEndpointMetadata, ROOT_BREADCRUMB, SAMPLE_ENDPOINT_DATA } from '../AppConstants';
import {
  PageEntityMetadata,
  PropType,
  PropertyMetadata,
  RestClient,
  StepMetadata,
  onchangeStepDefault
} from '../GenericConstants';
import ProcessTracking from '../common/ProcessTracking';

import ClearAllIcon from '@mui/icons-material/ClearAll';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { useLocation } from 'react-router-dom';
import PageEntityRender from '../renders/PageEntityRender';


export default function ActionCreation() {

  let initialStepsV3: Array<StepMetadata> = []
  const location = useLocation();
  const copyId = location.state?.copyId || "";
  const [processTracking, setCircleProcessOpen] = React.useState(false);
  const [stepMetadatas, setStepMetadatas] = React.useState(initialStepsV3);
  const restClient = React.useMemo(() => new RestClient(setCircleProcessOpen), [setCircleProcessOpen]);

  const properties: PropertyMetadata[] = [
    {
      propName: 'application',
      propLabel: 'Application',
      propValue: '',
      isRequired: true,
      layoutProperties: { xs: 12, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 2, sx: { pl: 10 } },
      valueElementProperties: { xs: 10 },
      propDescription: 'The application name',
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;

          setStepMetadatas(onchangeStepDefault(propName, propValue, (stepMetadata) => {
            if (stepMetadata.name === 'extEndpointCreation') {
              stepMetadata.label = propValue;
            }
          }));
        }
      }
    },
    {
      propName: 'taskName',
      propLabel: 'Task name',
      propValue: '',
      isRequired: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'noAttemptTimes',
      propLabel: 'Run times',
      propValue: 1,
      propDefaultValue: 1,
      isRequired: true,
      propExtraProperties: { type: "number" },
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'noParallelThread',
      propLabel: 'Thread count',
      propValue: 1,
      propDefaultValue: 1,
      isRequired: true,
      propExtraProperties: { type: "number" },
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'extEndpoint',
      propLabel: 'Targeting endpoint',
      propValue: '',
      isRequired: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'extEndpointMethod',
      propLabel: 'Http method',
      propValue: 'GET',
      propDefaultValue: 'GET',
      isRequired: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.Selection,
      selectionMeta: {
        selections: [
          { label: "GET", value: 'GET' },
          { label: "POST", value: 'POST' },
          { label: "PUT", value: 'PUT' },
          { label: "DELETE", value: 'DELETE' }
        ],
        onChangeEvent: function (event) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue, undefined, (propertyMetadata) => {
            if (propertyMetadata.propName === 'extEndpointData') {
              propertyMetadata.disabled = ["GET", "DELETE"].includes(propValue);
            }
          }));
        }
      }
    },
    {
      propName: 'generatorSaltLength',
      propLabel: 'Generator data length',
      propValue: '',
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'generatorSaltStartWith',
      propLabel: 'Generator start with',
      propValue: '',
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'generatorStrategy',
      propLabel: 'Generator data strategy',
      propValue: 'NONE',
      propDefaultValue: 'NONE',
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.Selection,
      selectionMeta: {
        selections: [
          { label: "GET", value: 'GET' },
          { label: "RANDOM", value: 'RANDOM' },
          { label: "SEQUENCE", value: 'SEQUENCE' },
          { label: "RANDOM_WITH_CONDITION", value: 'RANDOM_WITH_CONDITION' },
          { label: "NONE", value: 'NONE' }
        ],
        onChangeEvent: function (event) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'successCriteria',
      propLabel: 'Success condition',
      propValue: '',
      isRequired: true,
      propExtraProperties: { placeholder: 'Contain a text in success case' },
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'responseConsumerType',
      propLabel: 'Response Type',
      propValue: 'CONSOLE',
      propDefaultValue: 'CONSOLE',
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.Selection,
      selectionMeta: {
        selections: [
          { label: "CONSOLE", value: 'CONSOLE' },
          { label: "DATABASE", value: 'DATABASE' }
        ],
        onChangeEvent: function (event) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue, undefined, (propertyMetadata) => {
            if (propertyMetadata.propName === 'columnMetadata') {
              propertyMetadata.disabled = !["DATABASE"].includes(propValue);
            }
          }));
        }
      }
    },
    {
      propName: 'executorServiceType',
      propLabel: 'Executor Service',
      propValue: 'EXECUTE_WITH_EXECUTOR_SERVICE',
      propDefaultValue: 'EXECUTE_WITH_EXECUTOR_SERVICE',
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.Selection,
      selectionMeta: {
        selections: [
          { label: "EXECUTE_WITH_COMPLETABLE_FUTURE", value: 'EXECUTE_WITH_COMPLETABLE_FUTURE' },
          { label: "EXECUTE_WITH_EXECUTOR_SERVICE", value: 'EXECUTE_WITH_EXECUTOR_SERVICE' }
        ],
        onChangeEvent: function (event) {
          let propValue = event.target.value;
          let propName = event.target.name;
          setStepMetadatas(onchangeStepDefault(propName, propValue));
        }
      }
    },
    {
      propName: 'headers',
      propLabel: 'Headers',
      propValue: '{}',
      propDefaultValue: '{}',
      layoutProperties: { xs: 12 },
      labelElementProperties: { xs: 2, sx: { pl: 10 } },
      valueElementProperties: { xs: 10 },
      propType: PropType.CodeEditor,
      codeEditorMeta: {
        height: '100px',
        codeLanguges: [json()],
        onChangeEvent: function (propName) {
          return (value, _) => {
            let propValue = value;
            setStepMetadatas(onchangeStepDefault(propName, propValue));
          };
        }
      }
    },
    {
      propName: 'extEndpointData',
      propLabel: 'Body',
      propValue: '{}',
      propDefaultValue: '{}',
      disabled: true,
      layoutProperties: { xs: 12 },
      labelElementProperties: { xs: 2, sx: { pl: 10 } },
      valueElementProperties: { xs: 10 },
      isRequired: true,
      propType: PropType.CodeEditor,
      codeEditorMeta: {
        height: '200px',
        codeLanguges: [json()],
        onChangeEvent: function (propName) {
          return (value, _) => {
            let propValue = value;
            setStepMetadatas(onchangeStepDefault(propName, propValue));
          };
        }
      }
    },
    {
      propName: 'columnMetadata',
      propLabel: 'DB columns',
      propValue: '{}',
      propDefaultValue: '{}',
      disabled: true,
      layoutProperties: { xs: 12 },
      labelElementProperties: { xs: 2, sx: { pl: 10 } },
      valueElementProperties: { xs: 10 },
      isRequired: true,
      propType: PropType.CodeEditor,
      codeEditorMeta: {
        codeLanguges: [json()],
        onChangeEvent: function (propName) {
          return (value, _) => {
            let propValue = value;
            setStepMetadatas(onchangeStepDefault(propName, propValue));
          };
        }
      }
    }
  ];
  let initialStepMetadatas: Array<StepMetadata> = [
    {
      name: "extEndpointCreation",
      label: 'Endpoint metadata',
      description: 'This step is used to define an external endpoint information',
      properties: properties
    },
    {
      name: "review",
      label: 'Review',
      description: 'This step is used to review all steps',
      properties: [],
      onFinishStepClick: async (currentStepMetadata: Array<StepMetadata>) => {
        let endpointMetadata: ExtEndpointMetadata = getExtEndpointMetadataFromStepper(currentStepMetadata);
        EndpointBackendClient.create(endpointMetadata, restClient);
      }
    }
  ]

  React.useEffect(() => {
    setStepMetadatas(initialStepMetadatas);
    if (copyId) {
      EndpointBackendClient.loadExternalEndpointSettingAsync(
        parseInt(copyId),
        restClient,
        (endpointMetadata: EndpointDetail) => {
          endpointMetadata.application = `${endpointMetadata.application}-Copy`
          Object.keys(endpointMetadata).forEach((propertyName: string) => {
            setStepMetadatas(onchangeStepDefault(propertyName, endpointMetadata[propertyName as keyof EndpointDetail]));
          })
        });
    }
  }, [copyId, restClient])

  const getExtEndpointMetadataFromStepper = (currentStepMetadata: Array<StepMetadata>) => {
    const endpointMetadataStepIndex = 0;
    let endpointMetadataMetadata = currentStepMetadata.at(endpointMetadataStepIndex);
    if (!endpointMetadataMetadata) {
      throw new Error("Missing endpointMetadata definition");
    }
    const findStepPropertyByCondition = (stepMetadata: StepMetadata | undefined, filter: (property: PropertyMetadata) => boolean): PropertyMetadata | undefined => {
      return stepMetadata ? stepMetadata.properties.find(filter) : undefined;
    }
    const getExtEndpointMetadata = (): ExtEndpointMetadata => {
      let application = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "application")?.propValue;
      let taskName = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "taskName")?.propValue;
      let noAttemptTimes = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "noAttemptTimes")?.propValue;
      let noParallelThread = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "noParallelThread")?.propValue;
      let extEndpoint = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "extEndpoint")?.propValue;
      let method = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "extEndpointMethod")?.propValue;
      let data = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "extEndpointData")?.propValue;
      let headers = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "headers")?.propValue;
      let columnMetadata = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "columnMetadata")?.propValue;
      let generatorSaltLength = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "generatorSaltLength")?.propValue;
      let generatorSaltStartWith = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "generatorSaltStartWith")?.propValue;
      let generatorStrategy = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "generatorStrategy")?.propValue;
      let successCriteria = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "successCriteria")?.propValue;
      let responseConsumerType = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "responseConsumerType")?.propValue;
      let executorServiceType = findStepPropertyByCondition(endpointMetadataMetadata, property => property.propName === "executorServiceType")?.propValue;
      let endpointMetadataDefinition: ExtEndpointMetadata = {
        input: {
          application,
          taskName,
          noAttemptTimes,
          noParallelThread,
          executorServiceType,
          requestInfo: {
            extEndpoint,
            method,
            data,
            headers: JSON.parse(headers)
          },
          columnMetadata,
          dataGeneratorInfo: {
            generatorSaltLength,
            generatorSaltStartWith,
            generatorStrategy
          }
        },
        filter: {
          successCriteria
        },
        output: {
          responseConsumerType
        }
      }
      return endpointMetadataDefinition;
    }

    return getExtEndpointMetadata();
  }

  let initialPageEntityMetdata: PageEntityMetadata = {
    pageName: 'endpointMetadata-creation',
    breadcumbsMeta: [
      <LinkBreadcrumd underline="hover" key="1" color="inherit" href="/endpoints">
        {ROOT_BREADCRUMB}
      </LinkBreadcrumd>,
      <Typography key="3" color="text.primary">new</Typography>
    ],
    stepMetadatas: stepMetadatas,
    pageEntityActions: [
      {
        actionIcon: <TimelapseIcon />,
        actionLabel: "Load sample",
        actionName: "loadSample",
        onClick: () => {
          Object.keys(SAMPLE_ENDPOINT_DATA).forEach(propertyKey => {
            let propertyValue = SAMPLE_ENDPOINT_DATA[propertyKey]
            stepMetadatas[0].properties.filter(p => p.propName).forEach(p => {
              switch (p.propType) {
                case PropType.InputText:
                  p.textFieldMeta?.onChangeEvent({ target: { value: propertyValue, name: propertyKey } })
                  break;
                case PropType.Textarea:
                  p.textareaFieldMeta?.onChangeEvent({ target: { value: propertyValue, name: propertyKey } })
                  break;
                case PropType.Selection:
                case PropType.CodeEditor:
                case PropType.Switcher:
                default:
                  setStepMetadatas(onchangeStepDefault(propertyKey, propertyValue))
                  break;
              }
            })
          })
        }
      },
      {
        actionIcon: <ClearAllIcon />,
        actionLabel: "Clear sample",
        actionName: "clearAll",
        onClick: () => {
          Object.keys(SAMPLE_ENDPOINT_DATA).forEach(propertyKey => {
            setStepMetadatas(onchangeStepDefault(propertyKey, ''))
          })
        }
      },
    ]
  }


  return (
    <Stack spacing={4}>
      <PageEntityRender {...initialPageEntityMetdata} />
      <ProcessTracking isLoading={processTracking}></ProcessTracking>
    </Stack>
  );
}