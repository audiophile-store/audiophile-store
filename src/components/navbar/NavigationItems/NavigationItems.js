import { Box } from '@mui/material'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { pages } from '../../../app/constants'
import './NavigationItems.css'

export default function NavigationItems({ calledInFooter}) {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const isAdmin = isLoggedIn && user?.isAdmin;

  return (
   <Box display='flex' justifyContent='space-between' alignItems='center'>
      <Box className='Nav-Items'
        sx={ {
          flexGrow: 1,
          gap: 2,
          display: calledInFooter ? { xs: 'flex' } : { xs: 'none', '@media (min-width: 1031px)': { display: 'flex' } },
          flexDirection: { xs: `${calledInFooter ? 'column' : 'row'}`, sm: 'row' },
          justifyContent: { xs: 'center', sm: `${!calledInFooter ? 'center' : 'flex-end'}` },
          alignItems: 'center',
        } }>
        { pages.length && pages.map((page) => (
          <NavLink
            activeClassName='active'
            key={ page.title }
            to={ page.url }
            className='Link'>
            { page.title }
          </NavLink>
        )) }
        { isAdmin && (
          <NavLink
            activeClassName='active'
            to='/admin'
            className='Link'>
            Admin
          </NavLink>
        )}
      </Box>
   </Box>
  )
}
