// ============================================================
// Google Apps Script — 主機財產管理系統 Web App (動態欄位適應版)
// 請貼到試算表的「擴充功能 → Apps Script」，覆蓋後重新部署
// ============================================================

const SHEET_NAME = 'data';
const SECRET     = 'lchs'; // 🔑 操作密碼，需與網頁輸入一致

function doGet(e) {
  return _json({ status: 'ok', sheet: SHEET_NAME });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  // 嘗試取得鎖定，避免多人同時寫入衝突
  if (!lock.tryLock(10000)) {
    return _json({ result: 'error', message: '伺服器繁忙，請稍後重試' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return _json({ result: 'error', message: '無效的請求資料' });
    }

    const payload = JSON.parse(e.postData.contents);

    // 1. 驗證密碼
    if (String(payload._token).trim() !== SECRET) {
      return _json({ result: 'error', message: 'Unauthorized' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('找不到工作表: ' + SHEET_NAME);

    // 2. 動態讀取當前試算表所有欄位表頭
    const allValues = sheet.getDataRange().getValues();
    if (allValues.length === 0) throw new Error('工作表無資料');
    const headers = allValues[0].map(h => String(h).trim());

    // 3. 動態尋找「財產編號」在第幾欄
    let labelColIdx = headers.findIndex(h => /財產.*(編號|標籤)|(主機|設備).*(編號|標籤)|^財產$/.test(h));
    if (labelColIdx === -1) {
      labelColIdx = headers.findIndex(h => /財產|編號|標籤/.test(h));
    }
    if (labelColIdx === -1) {
      throw new Error('試算表中找不到「財產編號」欄位，請檢查表頭');
    }

    const action = payload.action || 'add';

    if (action === 'update') {
      // 取得欲更新的目標編號（支援去除減號與空格的比對）
      const rawTarget = payload.targetLabel || payload['財產編號'] || payload['財產標籤'] || '';
      const cleanTarget = normalizeCode(rawTarget);
      let targetRow = -1;

      for (let i = 1; i < allValues.length; i++) {
        const cellVal = String(allValues[i][labelColIdx]).trim();
        if (cellVal === rawTarget || normalizeCode(cellVal) === cleanTarget) {
          targetRow = i + 1; // 轉為 1-indexed
          break;
        }
      }

      if (targetRow !== -1) {
        // 找到列：逐欄動態寫入（時間戳記保留不覆蓋）
        headers.forEach((col, idx) => {
          if (col === '時間戳記') return;

          let val = '';
          if (payload[col] !== undefined) {
            val = payload[col];
          } else if (col === '備註' && payload['備註1'] !== undefined) {
            val = payload['備註1'];
          } else if (col === '備註1' && payload['備註'] !== undefined) {
            val = payload['備註'];
          } else if (/日期/.test(col) && payload['異動日期'] !== undefined) {
            val = payload['異動日期'];
          }

          sheet.getRange(targetRow, idx + 1).setValue(val);
        });
      } else {
        // 若找不到該財產編號列，當作新增處理
        sheet.appendRow(buildRowByHeaders(headers, payload));
      }

    } else {
      // 新增模式
      sheet.appendRow(buildRowByHeaders(headers, payload));
    }

    return _json({ result: 'success', action: action });

  } catch (err) {
    return _json({ result: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// 依據試算表當前欄位順序自動組裝新資料列
function buildRowByHeaders(headers, payload) {
  return headers.map(col => {
    col = String(col).trim();
    if (col === '時間戳記') {
      return Utilities.formatDate(new Date(), "GMT+8", "yyyy/MM/dd HH:mm:ss");
    }
    if (payload[col] !== undefined) {
      return payload[col];
    }
    // 相容性對應
    if (col === '備註' && payload['備註1'] !== undefined) return payload['備註1'];
    if (col === '備註1' && payload['備註'] !== undefined) return payload['備註'];
    if (/日期/.test(col) && payload['異動日期'] !== undefined) return payload['異動日期'];
    return '';
  });
}

// 正規化輔助：去除連字號、空白與特殊符號
function normalizeCode(str) {
  return (str || '').toString().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
