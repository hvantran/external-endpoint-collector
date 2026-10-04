import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  WizardCreationTemplate,
  StepMetadata,
  PropertyMetadata,
  PropType,
} from '@hvantran/ui-component-library';
import { PlayCircle, Trash2 } from 'lucide-react';
import {
  EndpointBackendClient,
  EndpointDetail,
  ExtEndpointMetadata,
  ROOT_BREADCRUMB,
  SAMPLE_ENDPOINT_DATA,
} from '../AppConstants';
import { RestClient } from '../GenericConstants';

export default function ExtEndpointCreation() {
  const location = useLocation();
  const navigate = useNavigate();
  const copyId = location.state?.copyId || '';

  const [activeStep, setActiveStep] = useState(0);
  const [processTracking, setCircleProcessOpen] = useState(false);
  const restClient = useMemo(() => new RestClient(setCircleProcessOpen), [setCircleProcessOpen]);

  const [steps, setSteps] = useState<StepMetadata[]>([
    {
      name: 'extEndpointCreation',
      label: 'Endpoint metadata',
      description: 'Define external endpoint information',
      properties: [
        {
          propName: 'application',
          propLabel: 'Application',
          propValue: '',
          isRequired: true,
          colSpan: 12,
          propDescription: 'The application name',
          propType: PropType.InputText,
        },
        {
          propName: 'taskName',
          propLabel: 'Task name',
          propValue: '',
          isRequired: true,
          colSpan: 6,
          propType: PropType.InputText,
        },
        {
          propName: 'noAttemptTimes',
          propLabel: 'Run times',
          propValue: 1,
          propDefaultValue: 1,
          isRequired: true,
          colSpan: 6,
          propType: PropType.InputText,
        },
        {
          propName: 'noParallelThread',
          propLabel: 'Thread count',
          propValue: 1,
          propDefaultValue: 1,
          isRequired: true,
          colSpan: 6,
          propType: PropType.InputText,
        },
        {
          propName: 'extEndpoint',
          propLabel: 'Targeting endpoint',
          propValue: '',
          isRequired: true,
          colSpan: 6,
          propType: PropType.InputText,
        },
        {
          propName: 'extEndpointMethod',
          propLabel: 'Http method',
          propValue: 'GET',
          propDefaultValue: 'GET',
          isRequired: true,
          colSpan: 6,
          propType: PropType.Selection,
          selectionMeta: {
            selections: [
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'DELETE', value: 'DELETE' },
            ],
          },
        },
        {
          propName: 'generatorSaltLength',
          propLabel: 'Generator data length',
          propValue: '',
          colSpan: 6,
          propType: PropType.InputText,
        },
        {
          propName: 'generatorSaltStartWith',
          propLabel: 'Generator start with',
          propValue: '',
          colSpan: 6,
          propType: PropType.InputText,
        },
        {
          propName: 'generatorStrategy',
          propLabel: 'Generator data strategy',
          propValue: 'NONE',
          propDefaultValue: 'NONE',
          colSpan: 6,
          propType: PropType.Selection,
          selectionMeta: {
            selections: [
              { label: 'GET', value: 'GET' },
              { label: 'RANDOM', value: 'RANDOM' },
              { label: 'SEQUENCE', value: 'SEQUENCE' },
              { label: 'RANDOM_WITH_CONDITION', value: 'RANDOM_WITH_CONDITION' },
              { label: 'NONE', value: 'NONE' },
            ],
          },
        },
        {
          propName: 'successCriteria',
          propLabel: 'Success condition',
          propValue: '',
          isRequired: true,
          colSpan: 6,
          textFieldMeta: { placeholder: 'Contain a text in success case' },
          propType: PropType.InputText,
        },
        {
          propName: 'responseConsumerType',
          propLabel: 'Response Type',
          propValue: 'CONSOLE',
          propDefaultValue: 'CONSOLE',
          colSpan: 6,
          propType: PropType.Selection,
          selectionMeta: {
            selections: [
              { label: 'CONSOLE', value: 'CONSOLE' },
              { label: 'DATABASE', value: 'DATABASE' },
            ],
          },
        },
        {
          propName: 'executorServiceType',
          propLabel: 'Executor Service',
          propValue: 'EXECUTE_WITH_EXECUTOR_SERVICE',
          propDefaultValue: 'EXECUTE_WITH_EXECUTOR_SERVICE',
          colSpan: 6,
          propType: PropType.Selection,
          selectionMeta: {
            selections: [
              { label: 'EXECUTE_WITH_COMPLETABLE_FUTURE', value: 'EXECUTE_WITH_COMPLETABLE_FUTURE' },
              { label: 'EXECUTE_WITH_EXECUTOR_SERVICE', value: 'EXECUTE_WITH_EXECUTOR_SERVICE' },
            ],
          },
        },
        {
          propName: 'headers',
          propLabel: 'Headers',
          propValue: '{}',
          propDefaultValue: '{}',
          colSpan: 12,
          propType: PropType.CodeEditor,
          codeEditorMeta: {
            height: '120px',
            codeLanguages: ['json'],
          },
        },
        {
          propName: 'extEndpointData',
          propLabel: 'Body',
          propValue: '{}',
          propDefaultValue: '{}',
          disabled: true,
          colSpan: 12,
          isRequired: true,
          propType: PropType.CodeEditor,
          codeEditorMeta: {
            height: '200px',
            codeLanguages: ['json'],
          },
        },
        {
          propName: 'columnMetadata',
          propLabel: 'DB columns',
          propValue: '{}',
          propDefaultValue: '{}',
          disabled: true,
          colSpan: 12,
          isRequired: true,
          propType: PropType.CodeEditor,
          codeEditorMeta: {
            height: '200px',
            codeLanguages: ['json'],
          },
        },
      ],
    },
    {
      name: 'review',
      label: 'Review',
      description: 'Review endpoint details and submit',
      properties: [],
    },
  ]);

  const handlePropertyChange = (stepIndex: number, propName: string, value: any) => {
    setSteps((prevSteps) =>
      prevSteps.map((step, idx) => {
        if (idx !== stepIndex) return step;
        return {
          ...step,
          properties: step.properties.map((prop) => {
            if (prop.propName === propName) {
              return { ...prop, propValue: value };
            }
            if (propName === 'extEndpointMethod' && prop.propName === 'extEndpointData') {
              return { ...prop, disabled: ['GET', 'DELETE'].includes(value) };
            }
            if (propName === 'responseConsumerType' && prop.propName === 'columnMetadata') {
              return { ...prop, disabled: value !== 'DATABASE' };
            }
            return prop;
          }),
        };
      })
    );
  };

  useEffect(() => {
    if (copyId) {
      EndpointBackendClient.loadExternalEndpointSettingAsync(
        parseInt(copyId, 10),
        restClient,
        (endpointMetadata: EndpointDetail) => {
          endpointMetadata.application = `${endpointMetadata.application}-Copy`;
          setSteps((prevSteps) =>
            prevSteps.map((step, idx) => {
              if (idx !== 0) return step;
              return {
                ...step,
                properties: step.properties.map((prop) => {
                  const val = endpointMetadata[prop.propName as keyof EndpointDetail];
                  return val !== undefined ? { ...prop, propValue: val } : prop;
                }),
              };
            })
          );
        }
      );
    }
  }, [copyId, restClient]);

  const handleFinish = async (currentSteps: StepMetadata[]) => {
    const firstStep = currentSteps[0];
    const findProp = (name: string) =>
      firstStep?.properties.find((p: PropertyMetadata) => p.propName === name)?.propValue;

    let headersParsed = {};
    try {
      headersParsed = JSON.parse(findProp('headers') || '{}');
    } catch (e) {
      headersParsed = {};
    }

    const endpointMetadata: ExtEndpointMetadata = {
      input: {
        application: findProp('application') || '',
        taskName: findProp('taskName') || '',
        noAttemptTimes: Number(findProp('noAttemptTimes')) || 1,
        noParallelThread: Number(findProp('noParallelThread')) || 1,
        executorServiceType: findProp('executorServiceType') || 'EXECUTE_WITH_EXECUTOR_SERVICE',
        requestInfo: {
          extEndpoint: findProp('extEndpoint') || '',
          method: findProp('extEndpointMethod') || 'GET',
          data: findProp('extEndpointData') || '{}',
          headers: headersParsed as any,
        },
        columnMetadata: findProp('columnMetadata') || '{}',
        dataGeneratorInfo: {
          generatorSaltLength: Number(findProp('generatorSaltLength')) || 0,
          generatorSaltStartWith: findProp('generatorSaltStartWith') || '',
          generatorStrategy: findProp('generatorStrategy') || 'NONE',
        },
      },
      filter: {
        successCriteria: findProp('successCriteria') || '',
      },
      output: {
        responseConsumerType: findProp('responseConsumerType') || 'CONSOLE',
      },
    };

    await EndpointBackendClient.create(endpointMetadata, restClient);
    navigate('/endpoints');
  };

  const loadSample = () => {
    setSteps((prevSteps) =>
      prevSteps.map((step, idx) => {
        if (idx !== 0) return step;
        return {
          ...step,
          properties: step.properties.map((prop) => {
            const val = SAMPLE_ENDPOINT_DATA[prop.propName];
            return val !== undefined ? { ...prop, propValue: val } : prop;
          }),
        };
      })
    );
  };

  const clearSample = () => {
    setSteps((prevSteps) =>
      prevSteps.map((step, idx) => {
        if (idx !== 0) return step;
        return {
          ...step,
          properties: step.properties.map((prop) => ({
            ...prop,
            propValue: prop.propDefaultValue ?? '',
          })),
        };
      })
    );
  };

  const breadcrumbs = [
    { label: ROOT_BREADCRUMB, href: '/endpoints' },
    { label: 'New' },
  ];

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={loadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-btn border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition"
        >
          <PlayCircle className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          Load sample
        </button>
        <button
          type="button"
          onClick={clearSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-btn border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          Clear sample
        </button>
      </div>
      <WizardCreationTemplate
        pageTitle="Create Endpoint"
        breadcrumbs={breadcrumbs}
        steps={steps}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onFinish={handleFinish}
        onPropertyChange={handlePropertyChange}
        onCancel={() => navigate('/endpoints')}
        loading={processTracking}
      />
    </div>
  );
}