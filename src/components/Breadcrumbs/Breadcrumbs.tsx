import type { MouseEvent } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import './Breadcrumbs.css';

function handleClick(event: MouseEvent<HTMLDivElement>) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}


export default function ActiveLastBreadcrumb() {
  const { pathname } = useLocation();
  const id = pathname.split('/').pop();
  const products = useAppSelector((state) => state.products.data);
  const isArticlePage = pathname.startsWith('/article/');
  let type = '';
  let articlePaths: string[] = [];
  if (isArticlePage) {
    type = products?.find(item => item.id === id)?.type ?? '';
    articlePaths = pathname.split('/').filter(path => path !== '');
  }

  return (
    <div role="presentation" onClick={handleClick} className='Breadcrumbs-Container'>
      <Breadcrumbs separator="›" aria-label="breadcrumb" className='Breadcrumbs'>
        <Link className='Breadcrumb-Link' to="/">
          Home
        </Link>
         <Link className='Breadcrumb-Link' to={type && `/${type}`}>
          {type ? type : id}
        </Link>
        { isArticlePage && <Link className='Breadcrumb-Link' to="#">
          {articlePaths[1]}
        </Link>}
      </Breadcrumbs>
    </div>
  );
}