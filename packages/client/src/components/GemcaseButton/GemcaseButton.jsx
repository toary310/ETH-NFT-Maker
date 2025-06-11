import { Collections as CollectionsIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
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
  const handleGemcaseClick = async () => {
    console.log('🎯 Gemcase button clicked!');
    console.log(`   Props - contractAddress: ${contractAddress}`);
    console.log(`   Props - networkName: ${networkName}`);

    const gemcaseUrls = getGemcaseCollectionUrl(contractAddress, networkName);

    if (gemcaseUrls && gemcaseUrls.primary) {
      console.log('🔗 Opening Gemcase collection:', gemcaseUrls.primary);

      // まずプライマリURLを試す
      const newWindow = window.open(gemcaseUrls.primary, '_blank', 'noopener,noreferrer');

      // 代替URLも表示（ユーザーが手動で試せるように）
      if (gemcaseUrls.alternatives && gemcaseUrls.alternatives.length > 0) {
        console.log('💡 If the page shows 404, try these alternative URLs:');
        gemcaseUrls.alternatives.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`);
        });

        // 5秒後に代替URLの案内を表示
        setTimeout(() => {
          if (confirm('Gemcaseページが見つからない場合は、代替URLを試しますか？\n（コンソールで代替URLを確認できます）')) {
            console.log('🔄 Alternative URLs:');
            gemcaseUrls.alternatives.forEach((url, index) => {
              console.log(`${index + 1}. ${url}`);
            });
          }
        }, 5000);
      }
    } else {
      console.error('❌ Failed to generate Gemcase URL');
      console.error('❌ Check contract address and network name');
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
          fontSize: '0.75rem',
          textAlign: 'center'
        }}
      >
        NFTマーケットプレイスで確認
        <br />
        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>
          404の場合はコンソールで代替URLを確認
        </span>
      </Typography>
    </Box>
  );
};

export default GemcaseButton;
