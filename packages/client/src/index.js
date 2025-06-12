// React���C�u�������C���|�[�g�iUI����邽�߂̃��C�����C�u�����j
import React from 'react';
// ReactDOM���C���|�[�g�iReact���u���E�U��DOM�ɕ`�悷�邽�߂̃��C�u�����j
import ReactDOM from 'react-dom/client';
// ���C���̃A�v���P�[�V�����R���|�[�l���g���C���|�[�g
import App from './App';
// �S�̂̃X�^�C���V�[�g���C���|�[�g
import './index.css';

/**
 * ? �A�v���P�[�V�����̃G���g���[�|�C���g
 *
 * �y���̃t�@�C���̖����z
 * ���̃t�@�C���́u�A�v���P�[�V�����̋N�����u�v�ł��B
 * �u���E�U���y�[�W��ǂݍ��񂾎��ɍŏ��Ɏ��s����A
 * React�A�v���P�[�V������HTML��DOM�v�f�ɕ`��i�����_�����O�j���܂��B
 *
 * �y�����̗���z
 * 1. HTML����'root'�Ƃ���ID�����v�f��������
 * 2. ������React�A�v���P�[�V������`�悷��ꏊ�����
 * 3. App�R���|�[�l���g��`�悷��
 * 4. React.StrictMode�ŊJ�����̖������o
 *
 * �yReact.StrictMode�Ƃ́H�z
 * - �J�����ɂ̂ݓ��삷����ʂȃ��[�h
 * - ���ݓI�Ȗ��𑁊��������邽�߂̃c�[��
 * - �񐄏���API�╛��p�̖����x��
 * - �{�Ԋ��ł͉e���Ȃ�
 *
 * �y���S�Ҍ�������z
 * - DOM = Document Object Model�iHTML�̍\����\������d�g�݁j
 * - root = HTML�t�@�C������<div id="root"></div>�v�f
 * - render = ��ʂɕ`�悷�邱��
 * - StrictMode = ��茵���ȃ`�F�b�N���s���J�����[�h
 */

// ? HTML����'root'�v�f�������āAReact�A�v���̕`��ꏊ���쐬
const root = ReactDOM.createRoot(document.getElementById('root'));

// ? ���ۂɃA�v���P�[�V��������ʂɕ`��
root.render(
  <React.StrictMode>
    {/* ���C���̃A�v���P�[�V�����R���|�[�l���g��`�� */}
    <App />
  </React.StrictMode>
);
