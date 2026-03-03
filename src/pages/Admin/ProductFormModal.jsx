import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import './ProductFormModal.css';

const PRODUCT_TYPES = [
  { value: 'headphones', label: 'Headphones' },
  { value: 'speakers', label: 'Speakers' },
  { value: 'earphones', label: 'Earphones' },
];

const EMPTY_PRODUCT = {
  title: '',
  shortName: '',
  type: '',
  price: '',
  inStock: '',
  generalInfo: '',
  newProduct: false,
  popularProduct: false,
  features: ['', ''],
  images: { cover: '', main: '', gallery: [] },
  inBox: [{ name: '', quantity: 1 }],
};

export default function ProductFormModal({ open, onClose, product }) {
  const [form, setForm] = useState(EMPTY_PRODUCT);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        shortName: product.shortName || '',
        type: product.type || '',
        price: product.price || '',
        inStock: product.inStock || '',
        generalInfo: product.generalInfo || '',
        newProduct: product.newProduct || false,
        popularProduct: product.popularProduct || false,
        images: product.images
          ? { cover: product.images.cover || '', main: product.images.main || '', gallery: product.images.gallery ? [...product.images.gallery] : [] }
          : { cover: '', main: '', gallery: [] },
        features: product.features?.length ? [...product.features] : ['', ''],
        inBox: product.inBox?.length
          ? product.inBox.map((item) => ({ ...item }))
          : [{ name: '', quantity: 1 }],
      });
    } else {
      setForm(EMPTY_PRODUCT);
    }
  }, [product]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleToggle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleFeatureChange = (index) => (e) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = e.target.value;
      return { ...prev, features };
    });
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: { ...prev.images, gallery: prev.images.gallery.filter((_, i) => i !== index) },
    }));
  };

  const handleUploadClick = () => {
    alert('Image upload is not yet implemented.');
  };

  const tryRequireImage = (path) => {
    try {
      return require(`../../assets/images/products${path}`);
    } catch {
      return null;
    }
  };

  const handleInBoxChange = (index, field) => (e) => {
    setForm((prev) => {
      const inBox = prev.inBox.map((item) => ({ ...item }));
      inBox[index][field] = field === 'quantity' ? Number(e.target.value) : e.target.value;
      return { ...prev, inBox };
    });
  };

  const addInBoxItem = () => {
    setForm((prev) => ({
      ...prev,
      inBox: [...prev.inBox, { name: '', quantity: 1 }],
    }));
  };

  const removeInBoxItem = (index) => {
    setForm((prev) => ({
      ...prev,
      inBox: prev.inBox.filter((_, i) => i !== index),
    }));
  };

  const isEdit = Boolean(product);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      className="ProductFormModal"
      PaperProps={{ className: 'ProductFormModal-Paper' }}
    >
      <DialogTitle className="ProductFormModal-Title">
        {isEdit ? 'Edit Product' : 'Add Product'}
        <IconButton onClick={onClose} size="small" className="ProductFormModal-CloseBtn">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="ProductFormModal-Content" dividers>
        <Box className="ProductFormModal-Section">
          <Typography variant="subtitle2" className="ProductFormModal-SectionTitle">
            Basic Info
          </Typography>
          <Box className="ProductFormModal-Row">
            <TextField
              label="Title"
              value={form.title}
              onChange={handleChange('title')}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Short Name"
              value={form.shortName}
              onChange={handleChange('shortName')}
              fullWidth
              size="small"
            />
          </Box>
          <Box className="ProductFormModal-Row">
            <TextField
              label="Type"
              value={form.type}
              onChange={handleChange('type')}
              select
              fullWidth
              size="small"
              required
            >
              {PRODUCT_TYPES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Price"
              value={form.price}
              onChange={handleChange('price')}
              type="number"
              fullWidth
              size="small"
              required
            />
            <TextField
              label="In Stock"
              value={form.inStock}
              onChange={handleChange('inStock')}
              type="number"
              fullWidth
              size="small"
            />
          </Box>
          <Box className="ProductFormModal-Row">
            <FormControlLabel
              control={
                <Switch checked={form.newProduct} onChange={handleToggle('newProduct')} />
              }
              label="New Product"
            />
            <FormControlLabel
              control={
                <Switch checked={form.popularProduct} onChange={handleToggle('popularProduct')} />
              }
              label="Popular Product"
            />
          </Box>
        </Box>

        <Box className="ProductFormModal-Section">
          <Typography variant="subtitle2" className="ProductFormModal-SectionTitle">
            Description
          </Typography>
          <TextField
            label="General Info"
            value={form.generalInfo}
            onChange={handleChange('generalInfo')}
            fullWidth
            size="small"
            multiline
            rows={4}
          />
        </Box>

        <Box className="ProductFormModal-Section">
          <Typography variant="subtitle2" className="ProductFormModal-SectionTitle">
            Features
          </Typography>
          {form.features.map((feature, index) => (
            <TextField
              key={index}
              label={`Feature ${index + 1}`}
              value={feature}
              onChange={handleFeatureChange(index)}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          ))}
        </Box>

        <Box className="ProductFormModal-Section">
          <Typography variant="subtitle2" className="ProductFormModal-SectionTitle">
            In the Box
          </Typography>
          {form.inBox.map((item, index) => (
            <Box key={index} className="ProductFormModal-InBoxRow">
              <TextField
                label="Item Name"
                value={item.name}
                onChange={handleInBoxChange(index, 'name')}
                fullWidth
                size="small"
              />
              <TextField
                label="Qty"
                value={item.quantity}
                onChange={handleInBoxChange(index, 'quantity')}
                type="number"
                size="small"
                className="ProductFormModal-QtyField"
              />
              <IconButton
                size="small"
                onClick={() => removeInBoxItem(index)}
                disabled={form.inBox.length <= 1}
                className="ProductFormModal-RemoveItemBtn"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addInBoxItem}
            className="ProductFormModal-AddItemBtn"
          >
            Add Item
          </Button>
        </Box>
                <Box className="ProductFormModal-Section">
          <Typography variant="subtitle2" className="ProductFormModal-SectionTitle">
            Images
          </Typography>
          {form.images.gallery.length > 0 ? (
            <Box className="ProductFormModal-GalleryGrid">
              {form.images.gallery.map((path, index) => {
                const src = path ? tryRequireImage(path) : null;
                return (
                  <Box key={index} className="ProductFormModal-Thumbnail">
                    {src ? (
                      <>
                        <img src={src} alt={`Product ${index + 1}`} />
                        <Box className="ProductFormModal-ThumbOverlay" onClick={() => removeGalleryImage(index)}>
                          <CloseIcon fontSize="small" />
                        </Box>
                      </>
                    ) : (
                      <Box className="ProductFormModal-ThumbBroken" onClick={() => removeGalleryImage(index)}>
                        <CloseIcon fontSize="small" className="ProductFormModal-ThumbBrokenX" />
                      </Box>
                    )}
                  </Box>
                );
              })}
              <Box className="ProductFormModal-UploadPlaceholder" onClick={handleUploadClick}>
                <AddPhotoAlternateOutlinedIcon fontSize="small" />
                <Typography variant="caption">Add</Typography>
              </Box>
            </Box>
          ) : (
            <Box className="ProductFormModal-EmptyImages" onClick={handleUploadClick}>
              <ImageOutlinedIcon />
              <Typography variant="body2">No images yet. Click to add.</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions className="ProductFormModal-Actions">
        <Button onClick={onClose} className="ProductFormModal-CancelBtn">
          Cancel
        </Button>
        <Button variant="contained" className="ProductFormModal-SaveBtn">
          {isEdit ? 'Save Changes' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
