import { Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import './QuantityInput.css';

interface QuantityInputProps {
  increaseHandler: () => void;
  decreaseHandler: () => void;
  quantity: number;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
}

export default function QuantityInput({ increaseHandler, decreaseHandler, quantity, increaseDisabled, decreaseDisabled }: QuantityInputProps) {
  return (
    <Box className="quantity-input-container">
      <IconButton
        onClick={ decreaseHandler }
        disabled={ decreaseDisabled }
        size="small"
        className="quantity-button"
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography variant="body1" className="quantity-number">
        { quantity }
      </Typography>
      <IconButton
        onClick={ increaseHandler }
        disabled={ increaseDisabled }
        size="small"
        className="quantity-button"
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}