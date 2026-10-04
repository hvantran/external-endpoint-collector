import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  EntityDetailTemplate,
  EntitySummaryTemplate,
  PropertyMetadata,
  PropType,
  ColumnMetadata,
  GenericActionMetadata,
  PagingResult,
  TextTruncate,
  TabMetadata,
} from '@hvantran/ui-component-library';
import { Bug, Copy, RefreshCw, Eye } from 'lucide-react';
import {
  EndpointBackendClient,
  EndpointDetail,
  ExtEndpointResponseOverview,
  OuputColumnMetadata,
  ROOT_BREADCRUMB,
} from '../AppConstants';
import {
  LocalStorageService,
  RestClient,
} from '../GenericConstants';

const pageIndexStorageKey = 'endpoint-collector-response-table-page-index';
const pageSizeStorageKey = 'endpoint-collector-response-table-page-size';
const orderByStorageKey = 'endpoint-collector-response-table-order';

export default function ExtEndpointDetails() {
  const targetAction = useParams<{ application: string }>();
  const navigate = useNavigate();
  const [processTracking, setCircleProcessOpen] = useState(false);
  const initialPagingResult: PagingResult = { totalElements: 0, content: [] };
  const [pagingResult, setPagingResult] = useState<PagingResult>(initialPagingResult);
  const [searchText, setSearchText] = useState('');
  const [pageIndex, setPageIndex] = useState(
    parseInt(LocalStorageService.getOrDefault(pageIndexStorageKey, 0), 10)
  );
  const [pageSize, setPageSize] = useState(
    parseInt(LocalStorageService.getOrDefault(pageSizeStorageKey, 10), 10)
  );
  const [orderBy, setOrderBy] = useState(
    LocalStorageService.getOrDefault(orderByStorageKey, '-column1')
  );
  const [activeTab, setActiveTab] = useState('Details');

  const restClient = useMemo(() => new RestClient(setCircleProcessOpen), [setCircleProcessOpen]);

  const endpointSettingId = targetAction.application;
  if (!endpointSettingId) {
    throw new Error('Action is required');
  }

  const breadcrumbs = [
    { label: ROOT_BREADCRUMB, href: '/endpoints' },
    { label: endpointSettingId },
  ];

  const tabs: TabMetadata[] = [
    { name: 'Details', label: 'Details' },
    { name: 'Responses', label: 'Responses' },
  ];

  const [columns, setColumns] = useState<ColumnMetadata[]>([
    {
      id: 'column1',
      label: 'Column 1',
      isSortable: true,
      minWidth: 100,
      isKeyColumn: true,
      renderCell: (row: any) => <TextTruncate text={row.column1 || ''} maxTextLength={50} />,
    },
    {
      id: 'column2',
      isSortable: true,
      label: 'Column 2',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column2 || ''} maxTextLength={50} />,
    },
    {
      id: 'column3',
      label: 'Column 3',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column3 || ''} maxTextLength={20} />,
    },
    {
      id: 'column4',
      label: 'Column 4',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column4 || ''} maxTextLength={50} />,
    },
    {
      id: 'column5',
      label: 'Column 5',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column5 || ''} maxTextLength={50} />,
    },
    {
      id: 'column6',
      label: 'Column 6',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column6 || ''} maxTextLength={50} />,
    },
    {
      id: 'column7',
      label: 'Column 7',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column7 || ''} maxTextLength={50} />,
    },
    {
      id: 'column8',
      label: 'Column 8',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column8 || ''} maxTextLength={50} />,
    },
    {
      id: 'column9',
      label: 'Column 9',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column9 || ''} maxTextLength={50} />,
    },
    {
      id: 'column10',
      label: 'Column 10',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column10 || ''} maxTextLength={50} />,
    },
    {
      id: 'actions',
      label: '',
      minWidth: 80,
      align: 'right',
      actions: [
        {
          actionIcon: <Eye className="w-4 h-4" />,
          actionLabel: 'Response details',
          actionName: 'gotoActionDetail',
          onClick: (row: ExtEndpointResponseOverview) => () => {
            navigate(`/endpoints/${endpointSettingId}/responses/${row.id}`);
          },
        },
      ],
    },
  ]);

  const [propertyMetadata, setPropertyMetadata] = useState<PropertyMetadata[]>([
    {
      propName: 'application',
      propLabel: 'Application',
      propValue: '',
      isRequired: true,
      disabled: true,
      colSpan: 12,
      propDescription: 'The application name',
      propType: PropType.InputText,
    },
    {
      propName: 'taskName',
      propLabel: 'Task name',
      propValue: '',
      isRequired: true,
      disabled: true,
      colSpan: 6,
      propType: PropType.InputText,
    },
    {
      propName: 'noAttemptTimes',
      propLabel: 'Run times',
      propValue: 1,
      propDefaultValue: 1,
      disabled: true,
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
      disabled: true,
      colSpan: 6,
      propType: PropType.InputText,
    },
    {
      propName: 'extEndpoint',
      propLabel: 'Targeting endpoint',
      propValue: '',
      disabled: true,
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
      disabled: true,
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
      disabled: true,
      colSpan: 6,
      propType: PropType.InputText,
    },
    {
      propName: 'generatorSaltStartWith',
      propLabel: 'Generator start with',
      propValue: '',
      disabled: true,
      colSpan: 6,
      propType: PropType.InputText,
    },
    {
      propName: 'generatorStrategy',
      propLabel: 'Generator data strategy',
      propValue: 'NONE',
      propDefaultValue: 'NONE',
      disabled: true,
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
      disabled: true,
      colSpan: 6,
      propType: PropType.InputText,
    },
    {
      propName: 'responseConsumerType',
      propLabel: 'Response Type',
      propValue: 'CONSOLE',
      disabled: true,
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
      disabled: true,
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
      disabled: true,
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
  ]);

  const loadSettings = () => {
    EndpointBackendClient.loadExternalEndpointSettingAsync(
      parseInt(endpointSettingId, 10),
      restClient,
      (endpointMetadata: EndpointDetail) => {
        setPropertyMetadata((prev) =>
          prev.map((p) => {
            const val = endpointMetadata[p.propName as keyof EndpointDetail];
            return val !== undefined ? { ...p, propValue: val } : p;
          })
        );
        try {
          const ouputColumnMetadata = JSON.parse(endpointMetadata.columnMetadata) as OuputColumnMetadata;
          if (ouputColumnMetadata?.columnMetadata) {
            ouputColumnMetadata.columnMetadata.forEach((colMeta) => {
              setColumns((prev) =>
                prev.map((col) =>
                  col.id === colMeta.mappingColumnName ? { ...col, label: colMeta.displayName } : col
                )
              );
            });
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    );
  };

  const loadResponses = () => {
    EndpointBackendClient.loadExternalEndpointResponseAsync(
      endpointSettingId,
      pageIndex,
      pageSize,
      orderBy,
      restClient,
      (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
    );
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpointSettingId, restClient]);

  useEffect(() => {
    loadResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpointSettingId, pageIndex, pageSize, orderBy, searchText, restClient]);

  const headerActions: GenericActionMetadata[] = [
    {
      actionIcon: <Bug className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      actionLabel: 'Troubleshoot in Kibana',
      actionName: 'troubleshootAction',
      onClick: () => {
        window.open(
          `${process.env.REACT_APP_TROUBLESHOOTING_BASE_URL || ''}app/r/s/IhzuH`,
          '_blank',
          'noopener,noreferrer'
        );
      },
    },
    {
      actionIcon: <Copy className="w-4 h-4" />,
      actionLabel: 'Clone',
      actionName: 'cloneJob',
      onClick: () => {
        navigate('/endpoints/new', { state: { copyId: endpointSettingId } });
      },
    },
    {
      actionIcon: <RefreshCw className="w-4 h-4" />,
      actionLabel: 'Refresh',
      actionName: 'refreshAction',
      onClick: () => {
        loadSettings();
        loadResponses();
      },
    },
  ];

  if (activeTab === 'Responses') {
    return (
      <EntitySummaryTemplate
        pageTitle={endpointSettingId}
        breadcrumbs={breadcrumbs}
        headerActions={headerActions}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tableProps={{
          name: 'Response Values',
          columns,
          keyColumn: 'column1',
          loading: processTracking,
          pagingResult,
          pagingOptions: {
            pageIndex,
            pageSize,
            orderBy,
            searchText,
            rowsPerPageOptions: [10, 50, 100, 500],
            onPageChange: (pIndex, pSize, pOrderBy, pSearch) => {
              setPageIndex(pIndex);
              setPageSize(pSize);
              setOrderBy(pOrderBy);
              setSearchText(pSearch);
              LocalStorageService.put(pageIndexStorageKey, pIndex);
              LocalStorageService.put(pageSizeStorageKey, pSize);
              LocalStorageService.put(orderByStorageKey, pOrderBy);
            },
          },
        }}
      />
    );
  }

  return (
    <EntityDetailTemplate
      pageTitle={endpointSettingId}
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      properties={propertyMetadata}
      onPropertyChange={(propName, value) => {
        setPropertyMetadata((prev) =>
          prev.map((p) => (p.propName === propName ? { ...p, propValue: value } : p))
        );
      }}
      disabled={processTracking}
    />
  );
}