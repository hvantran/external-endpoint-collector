import { Stack, ThemeProvider} from '@mui/material'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ErrorPage from './components/common/ErrorPage'
import ExtEndpointCreation from './components/ext-endpoints/ExtEndpointCreation'
import ExtEndpointDetails from './components/ext-endpoints/ExtEndpointDetails'
import ExtEndpointResponseDetails from './components/ext-endpoints/ExtEndpointResponseDetails'
import ExtEndpointSummary from './components/ext-endpoints/ExtEndpointSummary'
import { DARK_THEME, DEFAULT_THEME, LocalStorageService } from './components/GenericConstants'
import PrimarySearchAppBar from './ResponsiveAppBar'

const selectThemeStorageKey = "endpoint-collector-enable-dark-theme"

function App () {
  const [toggleDarkMode, setToggleDarkMode] = React.useState(LocalStorageService.getOrDefault(selectThemeStorageKey, false) === 'true');
  const switchTheme = () => {
    setToggleDarkMode((previous) => {
      LocalStorageService.put(selectThemeStorageKey, !previous);
      return !previous
    })
  }
  return (
    <ThemeProvider theme={!toggleDarkMode ? DEFAULT_THEME : DARK_THEME}>
      <Stack>
        <PrimarySearchAppBar toggleDarkMode={toggleDarkMode} setToggleDarkMode={switchTheme}/>
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
