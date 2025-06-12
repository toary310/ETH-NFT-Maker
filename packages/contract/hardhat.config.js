// ?? Hardhat�J���t���[�����[�N�̕K�v�ȃc�[�����C���|�[�g
require("@nomicfoundation/hardhat-toolbox");
// ? ���ϐ���ǂݍ��ނ��߂�dotenv���C�u�������C���|�[�g
require("dotenv").config({ path: "./.env" });

/**
 * ?? ETH-NFT-Maker�v���W�F�N�g�pHardhat�ݒ�t�@�C��
 *
 * �y���̃t�@�C���̖����z
 * ���̃t�@�C���́u�J�����̐݌v�}�v�̂悤�Ȗ������ʂ����܂��B
 * �X�}�[�g�R���g���N�g�̊J���A�e�X�g�A�f�v���C�ɕK�v�ȑS�Ă̐ݒ��
 * ��ӏ��ɂ܂Ƃ߂ĊǗ����A�J���҂������I�ɍ�Ƃł���悤�ɂ��܂��B
 *
 * �yHardhat�Ƃ́H�z
 * - Ethereum�X�}�[�g�R���g���N�g�J���p�̃t���[�����[�N
 * - �R���p�C���A�e�X�g�A�f�v���C�𓝍��Ǘ�
 * - ���[�J���J�����ƃe�X�g�l�b�g�̗������T�|�[�g
 * - �f�o�b�O�@�\��K�X�g�p�ʃ��|�[�g�@�\���
 *
 * �y�T�|�[�g����@�\�z
 * ? ���[�J���J���iHardhat�l�b�g���[�N�j
 * ? Sepolia�e�X�g�l�b�g�f�v���C�iAlchemy�o�R�j
 * ? ���ϐ��ɂ����S�Ȕ閧���Ǘ�
 * ? �R���g���N�g�œK���ݒ�
 * ? �K�X�g�p�ʃ��|�[�g
 * ? Etherscan�ł̃R���g���N�g����
 *
 * �y�K�v�Ȋ��ϐ��z
 * - ALCHEMY_API_KEY: Alchemy��API�L�[�iSepolia�l�b�g���[�N�p�j
 * - PRIVATE_KEY: �E�H���b�g�̔閧���i0x�v���t�B�b�N�X�Ȃ��j
 * - SEPOLIA_RPC_URL: Sepolia RPC URL�i�I�v�V�����A�f�t�H���g��Alchemy�j
 * - ETHERSCAN_API_KEY: Etherscan API�L�[�i�R���g���N�g���ؗp�j
 *
 * �y���S�Ҍ�������z
 * - RPC = Remote Procedure Call�i�u���b�N�`�F�[���Ƃ̒ʐM���@�j
 * - Alchemy = Ethereum�m�[�h�T�[�r�X�v���o�C�_�[
 * - Sepolia = Ethereum�̃e�X�g�l�b�g���[�N�i�����Ńe�X�g�\�j
 * - �閧�� = �E�H���b�g�́u�p�X���[�h�v�i��΂ɑ��l�ɋ����Ă͂����Ȃ��j
 */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // ? Solidity�R���p�C���̐ݒ�
  solidity: {
    version: "0.8.28",                    // �g�p����Solidity�̃o�[�W����
    settings: {
      optimizer: {                        // �R�[�h�œK���̐ݒ�
        enabled: true,                    // �œK����L���ɂ���
        runs: 200,                        // �œK���̎��s�񐔁i�����قǎ��s���K�X�팸�A���Ȃ��قǃf�v���C���K�X�팸�j
      },
      viaIR: true,                        // ���ԕ\�����g�p���Ă��ǂ��œK��������
    },
  },

  // ? �l�b�g���[�N�ݒ�i���[�J���J���ƃe�X�g�l�b�g�j
  networks: {
    // ? ���[�J���J���l�b�g���[�N�iHardhat�����j
    hardhat: {
      chainId: 31337,                     // ���[�J���l�b�g���[�N�̃`�F�[��ID
      // �y�����z
      // - ���S�Ƀ��[�J���œ���i�C���^�[�l�b�g�s�v�j
      // - �����Ńe�X�g�\
      // - �����Ȏ��s
      // - �f�o�b�O�@�\���L�x
    },

    // ? Sepolia�e�X�g�l�b�g���[�N�ݒ�
    sepolia: {
      // ? RPC URL�i�u���b�N�`�F�[���Ƃ̒ʐM�G���h�|�C���g�j
      url: process.env.SEPOLIA_RPC_URL || `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      // ? �f�v���C�Ɏg�p����A�J�E���g�i�閧�����琶���j
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,                  // Sepolia�̃`�F�[��ID
      gasPrice: "auto",                   // �K�X���i�������ݒ�
      gas: "auto",                        // �K�X�����������ݒ�
      // �y�����z
      // - ���ۂ�Ethereum�l�b�g���[�N�ɋ߂���
      // - �����̃e�X�gETH���g�p
      // - Etherscan�Ŋm�F�\
      // - �{�Ԋ��ւ̍ŏI�e�X�g�ɍœK
    },
  },

  // ? Etherscan�ł̃R���g���N�g���ؐݒ�i�I�v�V�����j
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    // �y�R���g���N�g���؂Ƃ́H�z
    // - �f�v���C�����R���g���N�g�̃\�[�X�R�[�h��Etherscan�Ō��J
    // - ���[�U�[���R���g���N�g�̓��e���m�F�ł���
    // - �������ƐM�����̌���
    // - Etherscan��ŃR���g���N�g�ƒ��ڂ����\
  },

  // ? �K�X�g�p�ʃ��|�[�g�ݒ�
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,  // REPORT_GAS���ϐ����ݒ肳��Ă���ꍇ�̂ݗL��
    currency: "USD",                                // �ʉݒP��
    // �y�K�X���|�[�g�Ƃ́H�z
    // - �e�֐��̃K�X�g�p�ʂ��ڍׂɕ���
    // - �R�X�g�œK���̂��߂̏d�v�ȏ��
    // - �֐����Ƃ̎��s�R�X�g��c��
    // - �p�t�H�[�}���X���P�̎w�W
  },

  // ? �t�@�C���p�X�ݒ�
  paths: {
    sources: "./contracts",               // Solidity�\�[�X�t�@�C���̏ꏊ
    tests: "./test",                      // �e�X�g�t�@�C���̏ꏊ
    cache: "./cache",                     // �R���p�C���L���b�V���̏ꏊ
    artifacts: "./artifacts",             // �R���p�C�����ʕ��̏ꏊ
  },

  // ? Mocha�e�X�g�t���[�����[�N�ݒ�
  mocha: {
    timeout: 40000,                       // �e�X�g�̃^�C���A�E�g���ԁi40�b�j
    // �y�Ȃ����߂̃^�C���A�E�g�H�z
    // - �u���b�N�`�F�[���Ƃ̒ʐM�͎��Ԃ�������
    // - �l�b�g���[�N�̒x�����l��
    // - ���G�ȃe�X�g�P�[�X�ɑΉ�
  },
};
