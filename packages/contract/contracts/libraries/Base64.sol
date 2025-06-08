// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Base64
 * @author Brecht Devos - <brecht@loopring.org>
 * @notice Base64エンコード/デコード機能を提供するライブラリ
 * @dev Solidity 0.8.28対応版
 * 
 * オンチェーンでSVGやJSONをBase64エンコードする際に使用
 * 主にNFTメタデータの動的生成で活用される
 */
library Base64 {
    /**
     * @dev バイト配列をBase64文字列にエンコードする
     * @param data エンコードするバイト配列
     * @return Base64エンコードされた文字列
     */
    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // Base64文字セット
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        // エンコード後の長さを計算（4/3倍、4の倍数に調整）
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // 結果を格納する文字列を作成
        string memory result = new string(encodedLen + 32);

        /// @solidity memory-safe-assembly
        assembly {
            // tableポインタを設定
            let tablePtr := add(table, 1)
            
            // resultのデータ部分へのポインタ
            let resultPtr := add(result, 32)
            
            // 3バイトずつ処理
            for {
                let dataPtr := data
                let endPtr := add(dataPtr, mload(data))
            } lt(dataPtr, endPtr) {
                
            } {
                // 3バイト読み込み（不足分は0でパディング）
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                // 4つの6ビット値に分割してBase64文字に変換
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }

            // パディング処理
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 0x3d) // '='
                mstore8(sub(resultPtr, 1), 0x3d) // '='
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d) // '='
            }

            // 文字列の長さを設定
            mstore(result, encodedLen)
        }

        return result;
    }

    /**
     * @dev 文字列をBase64エンコードする（便利関数）
     * @param str エンコードする文字列
     * @return Base64エンコードされた文字列
     */
    function encode(string memory str) internal pure returns (string memory) {
        return encode(bytes(str));
    }

    /**
     * @dev JSONオブジェクトをBase64エンコードしてdata URIを生成
     * @param json JSONオブジェクトの文字列
     * @return data:application/json;base64,xxx 形式の文字列
     */
    function encodeJSON(string memory json) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json;base64,",
            encode(bytes(json))
        ));
    }

    /**
     * @dev SVGをBase64エンコードしてdata URIを生成
     * @param svg SVGの文字列
     * @return data:image/svg+xml;base64,xxx 形式の文字列
     */
    function encodeSVG(string memory svg) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            encode(bytes(svg))
        ));
    }
}
