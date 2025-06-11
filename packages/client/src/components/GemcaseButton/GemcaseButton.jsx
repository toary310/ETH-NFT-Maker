import { Collections as CollectionsIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

/**
 * NFTマーケットプレイスへのリンクボタン群
 */
const MarketplaceButtons = ({
  contractAddress,
  networkName = 'sepolia',
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  sx = {}
}) => {
  const handleMarketplaceClick = (platform) => {
    console.log(`🎯 ${platform} button clicked!`);
    console.log(`   Props - contractAddress: ${contractAddress}`);
    console.log(`   Props - networkName: ${networkName}`);

    const urls = getNFTMarketplaceUrls(contractAddress, networkName);

    if (!urls) {
      console.error('❌ Failed to generate marketplace URLs');
      return;
    }

    let targetUrl;
    switch (platform) {
      case 'opensea':
        targetUrl = urls.opensea;
        console.log('🌊 Opening OpenSea:', targetUrl);
        break;
      case 'gemcase':
        targetUrl = urls.gemcase[0]; // プライマリGemcase URL
        console.log('💎 Opening Gemcase:', targetUrl);
        // 代替URLも表示
        console.log('💡 Alternative Gemcase URLs:', urls.gemcase.slice(1));
        break;
      case 'etherscan':
        targetUrl = urls.etherscan;
        console.log('🔍 Opening Etherscan:', targetUrl);
        break;
      default:
        console.error('❌ Unknown platform:', platform);
        return;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // コントラクトアドレスがない場合は表示しない
  if (!contractAddress) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...sx }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: 'text.primary',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        NFTマーケットプレイスで確認
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* OpenSea ボタン */}
        <Button
          variant="contained"
          size={size}
          onClick={() => handleMarketplaceClick('opensea')}
          startIcon={<CollectionsIcon />}
          endIcon={<OpenInNewIcon />}
          sx={{
            background: 'linear-gradient(45deg, #2081e2 0%, #1868b7 100%)',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            padding: '8px 16px',
            minWidth: '120px',
            '&:hover': {
              background: 'linear-gradient(45deg, #1868b7 0%, #145a9e 100%)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          OpenSea
        </Button>

        {/* Gemcase ボタン */}
        <Button
          variant="contained"
          size={size}
          onClick={() => handleMarketplaceClick('gemcase')}
          startIcon={<CollectionsIcon />}
          endIcon={<OpenInNewIcon />}
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            padding: '8px 16px',
            minWidth: '120px',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Gemcase
        </Button>

        {/* Etherscan ボタン */}
        <Button
          variant="outlined"
          size={size}
          onClick={() => handleMarketplaceClick('etherscan')}
          startIcon={<CollectionsIcon />}
          endIcon={<OpenInNewIcon />}
          sx={{
            borderColor: '#627eea',
            color: '#627eea',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            padding: '8px 16px',
            minWidth: '120px',
            '&:hover': {
              borderColor: '#5a6fd8',
              backgroundColor: 'rgba(98, 126, 234, 0.1)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Etherscan
        </Button>
      </Box>

      <Typography
        variant="caption"
        sx={{
          mt: 2,
          color: 'text.secondary',
          fontSize: '0.75rem',
          textAlign: 'center',
          maxWidth: '300px'
        }}
      >
        OpenSea（推奨）、Gemcase、Etherscanでコレクションを確認できます
      </Typography>
    </Box>
  );
};

export default MarketplaceButtons;
