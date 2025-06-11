# 🚀 Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables**: Prepare your configuration values

## Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `ETH-NFT-Maker` repository
4. Select the repository and click "Import"

## Step 2: Configure Build Settings

Vercel should auto-detect the React app, but verify these settings:

- **Framework Preset**: `Create React App`
- **Root Directory**: `./` (leave empty)
- **Build Command**: `yarn vercel-build`
- **Output Directory**: `packages/client/build`
- **Install Command**: `yarn install`

## Step 3: Environment Variables

Add these environment variables in Vercel Dashboard:

### Required Variables

```
REACT_APP_CONTRACT_ADDRESS=0xe97456126A0F678f31384Ac4c30Ee4B3EA16E615
REACT_APP_NETWORK_NAME=sepolia
```

### Optional (for real IPFS)

```
REACT_APP_W3UP_EMAIL=your-email@example.com
```

## Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Your app will be available at `https://your-project-name.vercel.app`

## Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

## Troubleshooting

### Build Errors

- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

### Runtime Errors

- Check browser console for errors
- Verify MetaMask is installed
- Ensure you're on Sepolia testnet

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] MetaMask connection works
- [ ] NFT creation process works
- [ ] Etherscan links are functional
- [ ] IPFS uploads work (if configured)

## Updating Deployment

Simply push to your main branch - Vercel will auto-deploy!

```bash
git push origin main
```
