import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import './Breadcrumbs.css';
import type { Product } from '../../types/product';

export default function ActiveLastBreadcrumb({ product }: { product?: Product }) {
  const { pathname } = useLocation();
  const id = pathname.split('/').pop();
  const products = useAppSelector((state) => state.products.data);
  const isArticlePage = pathname.startsWith('/article/');
  let type = '';
  let articlePaths: string[] = [];
  if (isArticlePage) {
    type = product?.type ?? products?.find((item) => item.id === id)?.type ?? '';
    articlePaths = pathname.split('/').filter((path) => path !== '');
  }

  return (
    <div className="Breadcrumbs-Container">
      <Breadcrumbs separator="›" aria-label="breadcrumb" className="Breadcrumbs">
        <Link className="Breadcrumb-Link" to="/">
          Home
        </Link>
        <Link className="Breadcrumb-Link" to={type && `/${type}`}>
          {type ? type : id}
        </Link>
        {isArticlePage && (
          <Link className="Breadcrumb-Link" to="#">
            {product?.title ?? articlePaths[1]}
          </Link>
        )}
      </Breadcrumbs>
    </div>
  );
}
