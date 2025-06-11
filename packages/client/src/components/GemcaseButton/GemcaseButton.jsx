import { Collections as CollectionsIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { getNFTMarketplaceUrls } from '../../utils/ipfsService';

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
    let alternativeUrls = [];

    switch (platform) {
      case 'opensea':
        if (Array.isArray(urls.opensea)) {
          targetUrl = urls.opensea[0];
          alternativeUrls = urls.opensea.slice(1);
        } else {
          targetUrl = urls.opensea;
        }
        console.log('🌊 Opening OpenSea:', targetUrl);
        if (alternativeUrls.length > 0) {
          console.log('💡 Alternative OpenSea URLs:', alternativeUrls);
        }
        break;
      case 'gemcase':
        targetUrl = urls.gemcase[0]; // プライマリGemcase URL
        alternativeUrls = urls.gemcase.slice(1);
        console.log('💎 Opening Gemcase:', targetUrl);
        console.log('💡 Alternative Gemcase URLs:', alternativeUrls);
        break;
      case 'etherscan':
        targetUrl = urls.etherscan;
        console.log('🔍 Opening Etherscan:', targetUrl);
        break;
      case 'search':
        // 検索URLを複数開く
        const searchUrl = urls.search.opensea_testnet_search;
        targetUrl = searchUrl;
        console.log('🔍 Opening marketplace search:', targetUrl);
        console.log('💡 Other search options:', urls.search);
        break;
      default:
        console.error('❌ Unknown platform:', platform);
        return;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');

      // 代替URLがある場合は5秒後に案内
      if (alternativeUrls.length > 0) {
        setTimeout(() => {
          console.log(`💡 ${platform}で404が表示された場合は、以下の代替URLを試してください:`);
          alternativeUrls.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
          });
        }, 3000);
      }
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

        {/* 検索ボタン */}
        <Button
          variant="outlined"
          size={size}
          onClick={() => handleMarketplaceClick('search')}
          startIcon={<CollectionsIcon />}
          endIcon={<OpenInNewIcon />}
          sx={{
            borderColor: '#ff6b35',
            color: '#ff6b35',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            padding: '8px 16px',
            minWidth: '120px',
            '&:hover': {
              borderColor: '#e55a2b',
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          検索
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
        OpenSea、Gemcase、検索、Etherscanでコレクションを確認できます。404の場合は検索ボタンをお試しください。
      </Typography>
    </Box>
  );
};

export default MarketplaceButtons;
