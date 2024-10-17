
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import RefreshIcon from '@mui/icons-material/Refresh';

import { Stack } from '@mui/material';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { green, red } from '@mui/material/colors';
import { Gauge } from '@mui/x-charts';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EndpointBackendClient, ExtEndpointOverview, ROOT_BREADCRUMB } from '../AppConstants';
import {
  ColumnMetadata,
  LocalStorageService,
  PageEntityMetadata,
  PagingOptionMetadata,
  PagingResult,
  RestClient,
  SpeedDialActionMetadata,
  TableMetadata,
  WithLink
} from '../GenericConstants';
import ProcessTracking from '../common/ProcessTracking';
import TextTruncate from '../common/TextTruncate';
import PageEntityRender from '../renders/PageEntityRender';


const pageIndexStorageKey = "endpoint-collector-summary-table-page-index"
const pageSizeStorageKey = "endpoint-collector-summary-table-page-size"
const orderByStorageKey = "endpoint-collector-summary-table-order"

export default function ExtEndpointSummary() {
  const navigate = useNavigate();
  const [processTracking, setCircleProcessOpen] = React.useState(false);
  let initialPagingResult: PagingResult = { totalElements: 0, content: [] };
  const [pagingResult, setPagingResult] = React.useState(initialPagingResult);
  const [pageIndex, setPageIndex] = React.useState(parseInt(LocalStorageService.getOrDefault(pageIndexStorageKey, 0)))
  const [pageSize, setPageSize] = React.useState(parseInt(LocalStorageService.getOrDefault(pageSizeStorageKey, 10)))
  const [orderBy, setOrderBy] = React.useState(LocalStorageService.getOrDefault(orderByStorageKey, '-createdAt'))

  const restClient = new RestClient(setCircleProcessOpen);

  const breadcrumbs = [
    <Link underline="hover" key="1" color="inherit" href='#'>
      {ROOT_BREADCRUMB}
    </Link>,
    <Typography key="3" color="text.primary">
      Summary
    </Typography>
  ];

  const columns: ColumnMetadata[] = [
    {
      id: 'endpointId',
      label: 'Endpoint ID', 
      isHidden: true,
      minWidth: 100, 
      isKeyColumn: true
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 100,
      isSortable: true
    },
    { 
      id: 'taskName', 
      label: 'Task', 
      minWidth: 100 ,
      isSortable: true
    },
    {
      id: 'targetURL',
      label: 'Target URL',
      minWidth: 170,
      align: 'left',
      format: (value: string) => (<TextTruncate text={value} maxTextLength={50} />),
      isSortable: true
    },
    {
      id: 'numberOfCompletedTasks',
      label: 'Number of completed',
      minWidth: 170,
      align: 'left',
      isSortable: true
    },
    {
      id: 'percentCompleted',
      label: 'Percent completed',
      minWidth: 170,
      align: 'left',
      isSortable: true,
      format: (value: number) => (<Gauge
        width={75}
        height={75}
        value={value}
        startAngle={0}
        endAngle={360}
        innerRadius="60%"
        outerRadius="100%"
      />)
    },
    {
      id: 'numberOfResponses',
      label: 'Number of responses',
      minWidth: 170,
      align: 'left',
      isSortable: true,
      format: (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    {
      id: 'createdAt',
      label: 'Created at',
      minWidth: 100,
      align: 'left',
      isSortable: true,
      format: (value: string) => value,
    },
    {
      id: 'elapsedTime',
      label: 'Elapsed time',
      minWidth: 100,
      align: 'left',
      isSortable: true,
      format: (value: string) => value,
    },
    {
      id: 'actions',
      label: '',
      minWidth: 100,
      align: 'right',
      actions: [
        {
          actionIcon: <ReadMoreIcon />,
          actionLabel: "Action details",
          actionName: "gotoActionDetail",
          onClick: (row: ExtEndpointOverview) => {
            return () => navigate(`/endpoints/${row.endpointId}`)
          }
        },
        {
          actionIcon: <DeleteIcon />,
          properties: { sx: { color: red[800] } },
          actionLabel: "Delete endpoint",
          actionName: "deletection",
          onClick: (row: ExtEndpointOverview) => {
            return () => {
              EndpointBackendClient.deleteEndpointCollector(row.endpointId, restClient, () => {
                EndpointBackendClient.loadEndpointSummaryAsync(
                  pageIndex,
                  pageSize,
                  orderBy,
                  restClient,
                  (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
                );
              })
            }
          }
        }
      ]
    }
  ];

  React.useEffect(() => {
    EndpointBackendClient.loadEndpointSummaryAsync(
      pageIndex,
      pageSize,
      orderBy,
      restClient,
      (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
    );
  }, [pageIndex, pageSize, orderBy])

  const endpoints: Array<SpeedDialActionMetadata> = [
    {
      actionIcon: WithLink('/endpoints/new', <AddCircleOutlineIcon />), actionName: 'create', actionLabel: 'New Endpoint', properties: {
        sx: {
          bgcolor: green[500],
          '&:hover': {
            bgcolor: green[800],
          }
        }
      }
    }
  ];

  let pagingOptions: PagingOptionMetadata = {
    pageIndex,
    pageSize,
    component: 'div',
    orderBy,
    rowsPerPageOptions: [5, 10, 20],
    onPageChange: (pageIndex: number, pageSize: number, orderBy: string) => {
      setPageIndex(pageIndex);
      setPageSize(pageSize);
      setOrderBy(orderBy);
      LocalStorageService.put(pageIndexStorageKey, pageIndex)
      LocalStorageService.put(pageSizeStorageKey, pageSize)
      LocalStorageService.put(orderByStorageKey, orderBy)
    }
  }

  let tableMetadata: TableMetadata = {
    columns,
    name: "Endpoint Overview",
    onRowClickCallback: (row: ExtEndpointOverview) => navigate(`/endpoints/${row.endpointId}`),
    pagingOptions: pagingOptions,
    pagingResult: pagingResult
  }

  let pageEntityMetadata: PageEntityMetadata = {
    pageName: 'ext-endpoint-summary',
    floatingActions: endpoints,
    tableMetadata: tableMetadata,
    breadcumbsMeta: breadcrumbs,
    pageEntityActions: [
      {
        actionIcon: <RefreshIcon />,
        actionLabel: "Refresh endpoints",
        actionName: "refreshAction",
        onClick: () => EndpointBackendClient.loadEndpointSummaryAsync(
          pageIndex,
          pageSize,
          orderBy,
          restClient,
          (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
        )
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