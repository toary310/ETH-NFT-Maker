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

Configure these build settings manually:

- **Framework Preset**: `Other` (not Create React App)
- **Root Directory**: `./` (leave empty)
- **Build Command**: `yarn workspace client build`
- **Output Directory**: `packages/client/build`
- **Install Command**: `yarn install`

## Step 3: Environment Variables

**Important**: Add these in Vercel Dashboard → Project Settings → Environment Variables

### Required Variables

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_CONTRACT_ADDRESS` | `0xe97456126A0F678f31384Ac4c30Ee4B3EA16E615` | Production, Preview, Development |
| `REACT_APP_NETWORK_NAME` | `sepolia` | Production, Preview, Development |

### Optional (for real IPFS)

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_W3UP_EMAIL` | `your-email@example.com` | Production, Preview, Development |

### How to Add Environment Variables:

1. Go to your project in Vercel Dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Click "Add New"
5. Enter Name and Value
6. Select environments (Production, Preview, Development)
7. Click "Save"

## Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Your app will be available at `https://your-project-name.vercel.app`

## Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

## Troubleshooting

### Environment Variable Errors

**Error**: `Environment Variable "REACT_APP_CONTRACT_ADDRESS" references Secret "react_app_contract_address", which does not exist.`

**Solution**:
1. Don't use the `env` section in vercel.json
2. Add environment variables manually in Vercel Dashboard
3. Go to Project Settings → Environment Variables
4. Add each variable individually

### Build Errors

**Error**: `sh: line 1: cd: packages/client: No such file or directory`

**Solution**:
- Use `yarn workspace client build` instead of `cd packages/client && yarn build`
- Set Framework Preset to "Other" instead of "Create React App"
- Ensure vercel.json uses workspace commands

**General Build Issues**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly
- Make sure vercel.json doesn't reference non-existent secrets

### Runtime Errors

- Check browser console for errors
- Verify MetaMask is installed
- Ensure you're on Sepolia testnet
- Check that environment variables are properly set

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
