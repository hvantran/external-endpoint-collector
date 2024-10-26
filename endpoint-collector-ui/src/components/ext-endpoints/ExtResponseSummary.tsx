

import RefreshIcon from '@mui/icons-material/Refresh';

import { Stack } from '@mui/material';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import {
    ColumnMetadata,
    LocalStorageService,
    PageEntityMetadata,
    PagingOptionMetadata,
    PagingResult,
    RestClient,
    TableMetadata
} from '../GenericConstants';
import ProcessTracking from '../common/ProcessTracking';

import { EndpointBackendClient } from '../AppConstants';

import TextTruncate from '../common/TextTruncate';
import PageEntityRender from '../renders/PageEntityRender';

const pageIndexStorageKey = "endpoint-responses-summary-table-page-index"
const pageSizeStorageKey = "endpoint-responses-summary-table-page-size"
const orderByStorageKey = "endpoint-responses-summary-table-order"

export default function ExtResponseSummary() {

    const [processTracking, setCircleProcessOpen] = React.useState(false);
    let initialPagingResult: PagingResult = { totalElements: 0, content: [] };
    const [pagingResult, setPagingResult] = React.useState(initialPagingResult);
    const [searchText, setSearchText] = React.useState("")
    const [pageIndex, setPageIndex] = React.useState(parseInt(LocalStorageService.getOrDefault(pageIndexStorageKey, 0)))
    const [pageSize, setPageSize] = React.useState(parseInt(LocalStorageService.getOrDefault(pageSizeStorageKey, 10)))
    const [orderBy, setOrderBy] = React.useState(LocalStorageService.getOrDefault(orderByStorageKey, '-column1'))
    const restClient = React.useMemo(() => new RestClient(setCircleProcessOpen), [setCircleProcessOpen]);

    const breadcrumbs = [
        <Link underline="hover" key="1" color="inherit" href='#'>
            Responses
        </Link>,
        <Typography key="3" color="text.primary">
            Summary
        </Typography>
    ];

    const columns: Array<ColumnMetadata> =
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
            }
        ];

    React.useEffect(() => {
        EndpointBackendClient.loadResponseSummaryAsync(
            pageIndex,
            pageSize,
            orderBy,
            searchText,
            restClient,
            (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
        );
    }, [pageIndex, pageSize, orderBy, searchText, restClient])

    let pagingOptions: PagingOptionMetadata = {
        pageIndex,
        pageSize,
        orderBy,
        searchText,
        component: 'div',
        rowsPerPageOptions: [10, 50, 100, 500],
        onPageChange: (pageIndex: number, pageSize: number, orderBy: string, searchText: string) => {
            setPageIndex(pageIndex);
            setPageSize(pageSize);
            setOrderBy(orderBy);
            setSearchText(searchText);
        }
    }

    let tableMetadata: TableMetadata = {
        columns,
        name: 'Response Overview',
        visibleSearchbar: true,
        tableContainerCssProps: { maxHeight: '100%' },
        pagingOptions: pagingOptions,
        pagingResult: pagingResult
    }


    let pageEntityMetadata: PageEntityMetadata = {
        pageName: 'ext-endpoint-responses-summary',
        tableMetadata: tableMetadata,
        breadcumbsMeta: breadcrumbs,
        pageEntityActions: [
            {
                actionIcon: <RefreshIcon />,
                actionLabel: "Refresh",
                actionName: "refreshAction",
                onClick: () => {
                    EndpointBackendClient.loadResponseSummaryAsync(
                        pageIndex,
                        pageSize,
                        orderBy,
                        searchText,
                        restClient,
                        (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
                    );
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