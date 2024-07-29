import { Stack, ThemeProvider } from '@mui/material'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ErrorPage from './components/common/ErrorPage'
import ExtEndpointCreation from './components/ext-endpoints/ExtEndpointCreation'
import ExtEndpointDetails from './components/ext-endpoints/ExtEndpointDetails'
import ExtEndpointResponseDetails from './components/ext-endpoints/ExtEndpointResponseDetails'
import ExtEndpointSummary from './components/ext-endpoints/ExtEndpointSummary'
import { DEFAULT_THEME } from './components/GenericConstants'
import PrimarySearchAppBar from './ResponsiveAppBar'

function App () {
  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <Stack spacing={4}>
        <PrimarySearchAppBar />
        <Routes>
          <Route
            path='/'
            element={<Navigate to="/endpoints" />}
            errorElement={<ErrorPage />}
          >
          </Route>
          <Route path='/endpoints' element={<ExtEndpointSummary />}></Route>
          <Route
            path='/endpoints/new'
            element={<ExtEndpointCreation />}
          ></Route>
          <Route
            path='/endpoints/:application'
            element={<ExtEndpointDetails />}
          ></Route>
          <Route
            path='/endpoints/:application/responses/:response'
            element={<ExtEndpointResponseDetails />}
          ></Route>
        </Routes>
      </Stack>
      <ToastContainer />
    </ThemeProvider>
  )
}
export default App
