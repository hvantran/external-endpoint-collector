
import PestControlIcon from '@mui/icons-material/PestControl';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { Stack } from '@mui/material';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import {
  ColumnMetadata,
  LocalStorageService,
  onChangeProperty,
  PageEntityMetadata,
  PagingOptionMetadata,
  PagingResult,
  PropertyMetadata,
  PropType,
  RestClient,
  TableMetadata
} from '../GenericConstants';
import ProcessTracking from '../common/ProcessTracking';

import { useNavigate, useParams } from 'react-router-dom';
import { EndpointBackendClient, EndpointDetail, ExtEndpointResponseOverview, OuputColumnMetadata, ROOT_BREADCRUMB } from '../AppConstants';

import { json } from '@codemirror/lang-json';
import { red } from '@mui/material/colors';
import TextTruncate from '../common/TextTruncate';
import PageEntityRender from '../renders/PageEntityRender';

const pageIndexStorageKey = "endpoint-collector-response-table-page-index"
const pageSizeStorageKey = "endpoint-collector-response-table-page-size"
const orderByStorageKey = "endpoint-collector-response-table-order"

export default function ExtEndpointDetails() {
  const targetAction = useParams();
  const navigate = useNavigate();
  const [processTracking, setCircleProcessOpen] = React.useState(false);
  let initialPagingResult: PagingResult = { totalElements: 0, content: [] };
  const [pagingResult, setPagingResult] = React.useState(initialPagingResult);
  const [pageIndex, setPageIndex] = React.useState(parseInt(LocalStorageService.getOrDefault(pageIndexStorageKey, 0)))
  const [pageSize, setPageSize] = React.useState(parseInt(LocalStorageService.getOrDefault(pageSizeStorageKey, 10)))
  const [orderBy, setOrderBy] = React.useState(LocalStorageService.getOrDefault(orderByStorageKey, '-column1'))
  const restClient = React.useMemo(() =>  new RestClient(setCircleProcessOpen), [setCircleProcessOpen]);

  const endpointSettingId: string | undefined = targetAction.application;
  if (!endpointSettingId) {
    throw new Error("Action is required");
  }

  const breadcrumbs = [
    <Link underline="hover" key="1" color="inherit" href='/endpoints'>
      {ROOT_BREADCRUMB}
    </Link>,
    <Typography key="3" color="text.primary">
      {endpointSettingId}
    </Typography>
  ];


  const [columns, setColumns] = React.useState<Array<ColumnMetadata>>(
    [
    {
      id: 'column1',
      label: 'Column 1',
      isSortable: true,
      minWidth: 100,
      isKeyColumn: true,
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column2',
      isSortable: true,
      label: 'Column 2',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column3',
      label: 'Column 3',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={20} />)
    },
    {
      id: 'column4',
      label: 'Column 4',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column5',
      label: 'Column 5',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column6',
      label: 'Column 6',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column7',
      label: 'Column 7',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column8',
      label: 'Column 8',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column9',
      label: 'Column 9',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'column10',
      label: 'Column 10',
      isSortable: true,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />)
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      actions: [
        {
          actionIcon: <ReadMoreIcon />,
          actionLabel: "Response details",
          actionName: "gotoActionDetail",
          onClick: (row: ExtEndpointResponseOverview) => {
            return () => navigate(`/endpoints/${endpointSettingId}/response/${row.id}`)
          }
        }
      ]
    }
  ]);

  const [propertyMetadata, setPropertyMetadata] = React.useState<Array<PropertyMetadata>>(
    [
    {
      propName: 'application',
      propLabel: 'Application',
      propValue: '',
      isRequired: true,
      disabled: true,
      layoutProperties: { xs: 12, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 2, sx: { pl: 10 } },
      valueElementProperties: { xs: 10 },
      propDescription: 'The application name',
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'taskName',
      propLabel: 'Task name',
      propValue: '',
      isRequired: true,
      disabled: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'noAttemptTimes',
      propLabel: 'Run times',
      propValue: 1,
      propDefaultValue: 1,
      disabled: true,
      isRequired: true,
      propExtraProperties: { type: "number" },
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'noParallelThread',
      propLabel: 'Thread count',
      propValue: 1,
      propDefaultValue: 1,
      isRequired: true,
      disabled: true,
      propExtraProperties: { type: "number" },
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'extEndpoint',
      propLabel: 'Targeting endpoint',
      propValue: '',
      disabled: true,
      isRequired: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'extEndpointMethod',
      propLabel: 'Http method',
      propValue: 'GET',
      propDefaultValue: 'GET',
      isRequired: true,
      disabled: true,
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
        onChangeEvent: function (event) { }
      }
    },
    {
      propName: 'generatorSaltLength',
      propLabel: 'Generator data length',
      propValue: '',
      disabled: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'generatorSaltStartWith',
      propLabel: 'Generator start with',
      propValue: '',
      disabled: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'generatorStrategy',
      propLabel: 'Generator data strategy',
      propValue: 'NONE',
      propDefaultValue: 'NONE',
      disabled: true,
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
        onChangeEvent: function (event) { }
      }
    },
    {
      propName: 'successCriteria',
      propLabel: 'Success condition',
      propValue: '',
      isRequired: true,
      disabled: true,
      propExtraProperties: { placeholder: 'Contain a text in success case' },
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.InputText,
      textFieldMeta: {
        onChangeEvent: function (event: any) { }
      }
    },
    {
      propName: 'responseConsumerType',
      propLabel: 'Response Type',
      propValue: 'CONSOLE',
      disabled: true,
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
        onChangeEvent: function (event) { }
      }
    },
    {
      propName: 'executorServiceType',
      propLabel: 'Executor Service Type',
      propValue: 'EXECUTE_WITH_EXECUTOR_SERVICE',
      propDefaultValue: 'EXECUTE_WITH_EXECUTOR_SERVICE',
      disabled: true,
      layoutProperties: { xs: 6, alignItems: "center", justifyContent: "center" },
      labelElementProperties: { xs: 4, sx: { pl: 10 } },
      valueElementProperties: { xs: 8 },
      propType: PropType.Selection,
      selectionMeta: {
        selections: [
          { label: "EXECUTE_WITH_COMPLETABLE_FUTURE", value: 'EXECUTE_WITH_COMPLETABLE_FUTURE' },
          { label: "EXECUTE_WITH_EXECUTOR_SERVICE", value: 'EXECUTE_WITH_EXECUTOR_SERVICE' }
        ],
        onChangeEvent: function (event) { }
      }
    },
    {
      propName: 'extEndpointData',
      propLabel: 'Data',
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
          return (value, _) => { };
        }
      }
    },
    {
      propName: 'columnMetadata',
      propLabel: 'Output column metadata',
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
          return (value, _) => { };
        }
      }
    }
  ]);

  React.useEffect(() => {
    EndpointBackendClient.loadExternalEndpointSettingAsync(
      parseInt(endpointSettingId),
      restClient,
      (endpointMetadata: EndpointDetail) => {
        Object.keys(endpointMetadata).forEach((propertyName: string) => {
          setPropertyMetadata(onChangeProperty(propertyName, endpointMetadata[propertyName as keyof EndpointDetail]));
        })
        let ouputColumnMetadata = JSON.parse(endpointMetadata.columnMetadata) as OuputColumnMetadata
        ouputColumnMetadata.columnMetadata.forEach(columnMetadata => {
          setColumns((previous) => {
            return [...previous].map(column => {
              if (column.id === columnMetadata.mappingColumnName) {
                column.label = columnMetadata.displayName
              }
              return column;
            })
          })
        })
      });
  }, [endpointSettingId, restClient]);

  React.useEffect(() => {
    EndpointBackendClient.loadExternalEndpointResponseAsync(
      endpointSettingId,
      pageIndex,
      pageSize,
      orderBy,
      restClient,
      (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
    )
  }, [endpointSettingId, pageIndex, pageSize, orderBy, restClient])


  let pagingOptions: PagingOptionMetadata = {
    pageIndex,
    pageSize,
    orderBy,
    component: 'div',
    rowsPerPageOptions: [10, 50, 100, 500],
    onPageChange: (pageIndex: number, pageSize: number, orderBy: string) => {
      setPageIndex(pageIndex);
      setPageSize(pageSize);
      setOrderBy(orderBy);
    }
  }

  let tableMetadata: TableMetadata = {
    columns,
    name: 'Response Values',
    tableContainerCssProps: {maxHeight: '100%'},
    pagingOptions: pagingOptions,
    pagingResult: pagingResult
  }

  let pageEntityMetadata: PageEntityMetadata = {
    pageName: 'ext-endpoint-responses-summary',
    tabMetadata: [
      {
        name: 'Details',
        properties: propertyMetadata
      },
      {
        name: 'Responses',
        tableMetadata
      }
    ],
    breadcumbsMeta: breadcrumbs,
    pageEntityActions: [
      {
        actionIcon:
          <Link underline="hover" key="1" color="black" target="_blank" href={`${process.env.REACT_APP_TROUBLESHOOTING_BASE_URL}app/r/s/IhzuH`} rel="noopener noreferrer">
            <PestControlIcon sx={{color: red[900]}}/>
          </Link>,
        actionLabel: "Troubleshoot in Kibana",
        actionName: "troubleshootAction"
      },
      {
          actionIcon: <ContentCopyIcon />,
          actionLabel: "Clone",
          actionName: "cloneJob",
          onClick: () => {
              navigate("/endpoints/new", { state: { copyId: endpointSettingId } })
          }
      },
      {
        actionIcon: <RefreshIcon />,
        actionLabel: "Refresh",
        actionName: "refreshAction",
        onClick: () => {
          EndpointBackendClient.loadExternalEndpointSettingAsync(
            parseInt(endpointSettingId),
            restClient,
            (endpointMetadata: EndpointDetail) => {
              Object.keys(endpointMetadata).forEach((propertyName: string) => {
                onChangeProperty(propertyName, endpointMetadata[propertyName as keyof EndpointDetail]);
              })
            });
          EndpointBackendClient.loadExternalEndpointResponseAsync(
            endpointSettingId,
            pageIndex,
            pageSize,
            orderBy,
            restClient,
            (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
          )
        }
      }
    ]
  }

  return (
    <Stack spacing={2}>
      <PageEntityRender {...pageEntityMetadata}></PageEntityRender>
      <ProcessTracking isLoading={processTracking}></ProcessTracking>
    </Stack>
  );
}