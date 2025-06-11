import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { OpenInNew as OpenInNewIcon, Collections as CollectionsIcon } from '@mui/icons-material';
import { getGemcaseCollectionUrl } from '../../utils/ipfsService';

/**
 * Gemcaseコレクションページへのリンクボタン
 */
const GemcaseButton = ({ 
  contractAddress, 
  networkName = 'sepolia',
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  sx = {}
}) => {
  const handleGemcaseClick = () => {
    const gemcaseUrl = getGemcaseCollectionUrl(contractAddress, networkName);
    
    if (gemcaseUrl) {
      console.log('🔗 Opening Gemcase collection:', gemcaseUrl);
      window.open(gemcaseUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.error('❌ Failed to generate Gemcase URL');
    }
  };

  // コントラクトアドレスがない場合は表示しない
  if (!contractAddress) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...sx }}>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleGemcaseClick}
        startIcon={<CollectionsIcon />}
        endIcon={<OpenInNewIcon />}
        sx={{
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold',
          textTransform: 'none',
          borderRadius: 2,
          padding: '12px 24px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
          ...sx
        }}
      >
        Gemcaseでコレクションを表示
      </Button>
      
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 1, 
          color: 'text.secondary',
          fontSize: '0.75rem'
        }}
      >
        NFTマーケットプレイスで確認
      </Typography>
    </Box>
  );
};

export default GemcaseButton;
