import AccountCircle from '@mui/icons-material/AccountCircle';
import AppsIcon from '@mui/icons-material/Apps';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { Grid, Paper } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import DarkModeToggle from './components/common/DarkModeToggle';
import { Search, SearchIconWrapper, StyledInputBase } from './components/common/GenericComponent';

const APP_ENVIRONMENT_VARIABLES = window._env_;

const pages = JSON.parse(`${APP_ENVIRONMENT_VARIABLES.REACT_APP_PAGES}`);


export default function PrimarySearchAppBar(props: any) {
  const setToggleDarkMode = props.setToggleDarkMode
  const toggleDarkMode = props.toggleDarkMode
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorAppSwicherEl, setAnchorAppSwicherEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isAppSwicherMenuOpen = Boolean(anchorAppSwicherEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleAppSwitcherMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorAppSwicherEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleAppSwicherMenuClose = () => {
    setAnchorAppSwicherEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const goooApp = function (targetURL: string) {
    window.location.href = targetURL;
  }

  const renderAppSwicherMenu = (
    <Menu
      anchorEl={anchorAppSwicherEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id="primary-app-swicher-menu"
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isAppSwicherMenuOpen}
      onClose={handleAppSwicherMenuClose}
    >
      <Grid container spacing={2}
        sx={{ maxWidth: '600px' }}
        direction="row"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '30vh' }}>
        <Grid item xs={6}>
          <Paper variant="outlined" square sx={{ mx: 2, textAlign: 'center' }} onClick={() => goooApp(`${APP_ENVIRONMENT_VARIABLES.REACT_APP_TEMPLATE_MANAGER_FRONTEND_URL}/templates`)}>
            <img alt={APP_ENVIRONMENT_VARIABLES.REACT_APP_TEMPLATE_MANAGER_NAME} src='/template-manager.png' width={70} />
            <Typography variant="caption" display="block" gutterBottom>
              {APP_ENVIRONMENT_VARIABLES.REACT_APP_TEMPLATE_MANAGER_NAME}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper variant="outlined" square sx={{ mx: 2, textAlign: 'center' }} onClick={() => goooApp(`${APP_ENVIRONMENT_VARIABLES.REACT_APP_ACTION_MANAGER_FRONTEND_URL}/actions`)}>
            <img alt={APP_ENVIRONMENT_VARIABLES.REACT_APP_ACTION_MANAGER_NAME} src='/action-manager.png' width={70} />
            <Typography variant="caption" display="block" gutterBottom>
              {APP_ENVIRONMENT_VARIABLES.REACT_APP_ACTION_MANAGER_NAME}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper variant="outlined" square sx={{ mx: 2, textAlign: 'center' }} onClick={() => goooApp(`${APP_ENVIRONMENT_VARIABLES.REACT_APP_ENDPOINT_MANAGER_FRONTEND_URL}/endpoints`)}>
            <img alt={APP_ENVIRONMENT_VARIABLES.REACT_APP_ENDPOINT_MANAGER_NAME} src='/data-collection.png' width={70} />
            <Typography variant="caption" display="block" gutterBottom>
              {APP_ENVIRONMENT_VARIABLES.REACT_APP_ENDPOINT_MANAGER_NAME}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
      <MenuItem onClick={setToggleDarkMode}>
        <DarkModeToggle checked={toggleDarkMode} onClick={setToggleDarkMode}></DarkModeToggle>
        <p>Enable dark mode</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {APP_ENVIRONMENT_VARIABLES.REACT_APP_NAME}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page: any) => (
              <Button key={page.name} variant="outlined" href={page.link}
                sx={{ color: 'white', display: 'block' }}
              >
                {page.uiName}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <DarkModeToggle checked={toggleDarkMode} onClick={setToggleDarkMode}></DarkModeToggle>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton size="large" aria-label="show 4 new mails" color="inherit">
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <IconButton
              size="large"
              aria-label="App switcher"
              aria-controls="primary-search-account-menu"
              onClick={handleAppSwitcherMenuOpen}
              aria-haspopup="true"
              color="inherit"
            >
              <AppsIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {renderAppSwicherMenu}

    </Box>
  );
}