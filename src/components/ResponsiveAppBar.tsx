'use client';

import * as React from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Menu, MenuItem, Avatar,
  Tooltip, Container, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '@/context/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const MenuButton = ({ label, items }: {
  label: string;
  items: { label: string; href: string }[];
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button onClick={handleClick}>{label}</Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {items.map((item) => (
          <MenuItem key={item.href} onClick={handleClose} component="a" href={item.href}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const ResponsiveAppBar = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useColorMode();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

    const handleLogout = async () => {
        try {
        await signOut(auth);
        await fetch('/api/session/logout', { method: 'POST' });
        window.location.href = '/login';
        } catch (error) {
        console.error('Erreur de déconnexion :', error);
        }
    };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          {/* LOGO desktop */}
          <Box component="a" href="/dashboard" sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            <img src="/logo.png" alt="logo" style={{ height: 60 }} />
          </Box>

          {/* MENU BURGER mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={handleOpenNavMenu}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu}>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/dashboard">Accueil</MenuItem>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/performances/objectifs">Objectifs</MenuItem>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/performances/statistiques">Statistiques</MenuItem>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/animaux">Animaux</MenuItem>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/autre/contacts">Contacts</MenuItem>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/autre/souhaits">Souhaits</MenuItem>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/autre/notes">Notes</MenuItem>
              <MenuItem onClick={handleCloseNavMenu} component="a" href="/autre/groupes">Groupes</MenuItem>
            </Menu>
          </Box>

          {/* LOGO mobile */}
          <Box component="a" href="/dashboard" sx={{ display: { xs: 'flex', md: 'none' }, mr: 2 }}>
            <img src="/logo.png" alt="logo" style={{ height: 60 }} />
          </Box>

          {/* MENU desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button href="/dashboard">Accueil</Button>

            <MenuButton label="Performances" items={[
              { label: 'Objectifs', href: '/performances/objectifs' },
              { label: 'Statistiques', href: '/performances/statistiques' },
            ]} />

            <Button href="/animaux">Animaux</Button>

            <MenuButton label="Autre" items={[
              { label: 'Contacts', href: '/autre/contacts' },
              { label: 'Souhaits', href: '/autre/souhaits' },
              { label: 'Notes', href: '/autre/notes' },
              { label: 'Groupes', href: '/autre/groupes' },
            ]} />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* SWITCH THÈME */}
          <IconButton onClick={toggleMode} sx={{ ml: 1 }} aria-label="Changer de thème">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* AVATAR */}
          <Box sx={{ flexGrow: 0, ml: 2 }}>
            <Tooltip title="Menu utilisateur">
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar alt="Profil" src="/avatar.jpg" />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
              <MenuItem onClick={handleCloseUserMenu} component="a" href="/abonnement">Gérer mon abonnement</MenuItem>
              <MenuItem onClick={handleCloseUserMenu} component="a" href="/support">Support utilisateur</MenuItem>
              <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default ResponsiveAppBar;
