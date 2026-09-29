import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import ProductFormModal from './ProductFormModal';
import { formatCurrency } from '../../utils/utils';
import './Admin.css';

const TYPE_LABELS = {
  headphones: 'Headphones',
  speakers: 'Speakers',
  earphones: 'Earphones',
};

export default function Admin() {
  const products = useSelector((state) => state.products.data);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const handleEdit = (product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  const handleDeleteClick = (product) => {
    setDeleteProduct(product);
  };

  const handleDeleteConfirm = () => {
    // TODO: dispatch deleteProduct action
    setDeleteProduct(null);
  };

  const handleDeleteCancel = () => {
    setDeleteProduct(null);
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box className="Admin">
      <Box className="Admin-Header">
        <Typography variant="h5" className="Admin-Title">
          Products
        </Typography>
        <Typography variant="body2" className="Admin-Subtitle">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </Typography>
      </Box>

      <Box className="Admin-Toolbar">
        <TextField
          placeholder="Search products..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="Admin-Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <IconButton className="Admin-AddButton" onClick={handleAdd}>
          <AddIcon />
        </IconButton>
      </Box>

      <TableContainer className="Admin-TableContainer">
        <Table>
          <TableHead>
            <TableRow className="Admin-TableHead">
              <TableCell>Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id} className="Admin-TableRow">
                <TableCell>
                  <Box className="Admin-ProductCell">
                    <img
                      src={require(`../../assets/images/products${product.images.cover}`)}
                      alt={product.shortName}
                      className="Admin-ProductImage"
                    />
                    <Box>
                      <Typography variant="body2" className="Admin-ProductName">
                        {product.shortName}
                      </Typography>
                      <Typography variant="caption" className="Admin-ProductId">
                        {product.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={TYPE_LABELS[product.type] || product.type}
                    size="small"
                    className={`Admin-TypeChip Admin-TypeChip--${product.type}`}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" className="Admin-Price">
                    {formatCurrency(product.price)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    className={`Admin-Stock ${product.inStock <= 10 ? 'Admin-Stock--low' : ''}`}
                  >
                    {product.inStock}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box className="Admin-Actions">
                    <IconButton size="small" className="Admin-EditBtn" onClick={() => handleEdit(product)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className="Admin-DeleteBtn" onClick={() => handleDeleteClick(product)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" className="Admin-Empty">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        product={editProduct}
      />

      <Dialog
        open={Boolean(deleteProduct)}
        onClose={handleDeleteCancel}
        PaperProps={{ className: 'Admin-DeleteDialog' }}
      >
        <DialogTitle className="Admin-DeleteDialog-Title">
          Delete Product
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{deleteProduct?.shortName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions className="Admin-DeleteDialog-Actions">
          <Button onClick={handleDeleteCancel} className="Admin-DeleteDialog-CancelBtn">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" className="Admin-DeleteDialog-ConfirmBtn">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
