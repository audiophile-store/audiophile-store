import { Box, Skeleton, Typography } from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import '../../components/CollectionItem/CollectionItem.css';
import './Home.css';

export default function HomeSkeleton() {
  const historyCount = useAppSelector((state) => state.recentlyViewed.ids.length);
  const recentCount = historyCount || 3;

  return (
    <Box className="Product-Catalogue-Surface">
      <Box
        className="Home-Main-Content"
        role="progressbar"
        aria-label="Loading products"
        aria-busy="true"
      >
        <Box component="section" aria-labelledby="popular-products-loading-heading">
          <Box className="Home-Section-Header">
            <Typography component="h1" id="popular-products-loading-heading">
              Popular products
            </Typography>
            <Skeleton variant="text" width={100} height={36} aria-hidden="true" />
          </Box>
          <Box className="Home-Popular-Grid" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Box className="Product-Card Home-Skeleton-Card" key={index}>
                <Box className="Product-Card-Image">
                  <Skeleton variant="rectangular" className="Home-Skeleton-Product-Image" />
                  <Skeleton
                    variant="circular"
                    width={20}
                    height={20}
                    className="Home-Skeleton-Favorite"
                  />
                </Box>
                <Box className="Product-Card-Information">
                  <Box className="Home-Skeleton-Title">
                    <Skeleton variant="text" width="90%" height={24} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                  <Box className="Product-Card-Tags">
                    <Skeleton variant="rounded" width={62} height={24} />
                    <Skeleton variant="rounded" width={94} height={24} />
                  </Box>
                  <Box className="Product-Card-Footer">
                    <Skeleton variant="text" width={90} height={28} />
                    <Skeleton variant="circular" width={40} height={40} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="section" aria-labelledby="recently-viewed-loading-heading">
          <Box className="Home-Section-Header">
            <Typography component="h2" id="recently-viewed-loading-heading">
              Recently viewed
            </Typography>
            <Skeleton variant="text" width={64} height={36} aria-hidden="true" />
          </Box>
          <Box className="Home-Recent-Grid" aria-hidden="true">
            {Array.from({ length: recentCount }, (_, index) => (
              <Box className="Home-Recent-Card" key={index}>
                <Skeleton variant="rounded" className="Home-Skeleton-Recent-Image" />
                <Box className="Home-Recent-Info Home-Skeleton-Recent-Info">
                  <Skeleton variant="text" width="95%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width={70} height={20} sx={{ marginTop: '4px' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
