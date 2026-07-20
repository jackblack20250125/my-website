// ★★★ 請替換這行，貼上你的試算表 ID ★★★
var sheetId = '1axKBevlnsaNwaTsYeH1qNiFIYT-LL7-ylr5pwAjzVV0';

// Google Drive 簽名存放資料夾 ID
var SIGNATURE_FOLDER_ID = 'https://drive.google.com/drive/folders/18GaFr54V8pyOGTgBfc2jbPsfnHD3zvjb';

// 確認紀錄工作簿名稱
var RECORD_SHEET_NAME = '紀錄';

function doGet(e) { return handleResponse(e); }
function doPost(e) { return handleResponse(e); }

function handleResponse(e) {
  try {
    var ss = SpreadsheetApp.openById(sheetId);

    var action = "read";
    var sheetName = "行動車1";
    var payload = {};

    if (e.postData && e.postData.contents) {
      var postData = JSON.parse(e.postData.contents);
      action = postData.action || action;
      sheetName = postData.sheetName || sheetName;
      payload = postData;
    } else if (e.parameter) {
      action = e.parameter.action || action;
      sheetName = e.parameter.sheetName || sheetName;
      payload = e.parameter;
    }

    // ════════════════════════════════════════
    // 【READ】讀取工作表
    // ════════════════════════════════════════
    if (action === 'read') {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        return jsonOut({ status: 'error', message: '找不到工作表: ' + sheetName });
      }
      var data = sheet.getDataRange().getDisplayValues();
      if (data.length <= 1) return jsonOut({ status: 'success', data: [] });

      var headers = data[0];
      var result = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          if (headers[j] !== "") obj[headers[j]] = row[j];
        }
        result.push(obj);
      }
      return jsonOut({ status: 'success', data: result });
    }

    // ════════════════════════════════════════
    // 【READ_CONFIRMED】讀取已確認處室清單
    // ════════════════════════════════════════
    if (action === 'readConfirmed') {
      var nendo = payload.nendo || '';
      var ki = payload.ki || '';

      var recSheet = ss.getSheetByName(RECORD_SHEET_NAME);
      if (!recSheet || recSheet.getLastRow() <= 1) {
        return jsonOut({ status: 'success', data: [] });
      }
      var rData = recSheet.getDataRange().getDisplayValues();
      var rHeaders = rData[0];
      var result = [];
      for (var i = 1; i < rData.length; i++) {
        var row = rData[i];
        var obj = {};
        for (var j = 0; j < rHeaders.length; j++) {
          if (rHeaders[j]) obj[rHeaders[j]] = row[j];
        }
        // 若有傳年度/季，只回傳符合的
        if (nendo && obj['年度'] && obj['年度'] !== nendo) continue;
        if (ki && obj['季'] && obj['季'] !== ki) continue;
        result.push(obj);
      }
      return jsonOut({ status: 'success', data: result });
    }

    // ════════════════════════════════════════
    // 【SAVE_SIGNATURE】儲存簽名 + 寫紀錄 + 更新設定
    // ════════════════════════════════════════
    if (action === 'saveSignature') {
      var now    = Utilities.formatDate(new Date(), "GMT+8", "yyyy/MM/dd HH:mm:ss");

      var unitCode  = payload.unit     || 'unknown';
      var unitName  = payload.unitName || '';
      var nendo     = payload.nendo    || '';
      var ki        = payload.ki       || '';
      var sigBase64 = (payload.signatureBase64 || '').replace(/^data:image\/png;base64,/, '');

      // 1️⃣ 存圖到 Drive (改檔名格式)
      var fileUrl = '';
      if (sigBase64) {
        try {
          var folder = DriveApp.getFolderById(SIGNATURE_FOLDER_ID);
          
          // 檔名格式：115年度第1季_教務處+2026-03-18_10-20-30.png
          // （因為 Windows 和 Mac 的檔名不能有斜線 / 或冒號 :，所以取代掉）
          var safeTimeForName = now.replace(/\//g, '-').replace(/ /g, '_').replace(/:/g, '-');
          var filename = nendo + '年度第' + ki + '季_' + unitName + '+' + safeTimeForName + '.png';
          
          var blob = Utilities.newBlob(Utilities.base64Decode(sigBase64), 'image/png', filename);
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          fileUrl = file.getUrl();
        } catch (driveErr) {
          // Drive 存檔失敗不中斷，仍寫紀錄
          fileUrl = 'Drive錯誤: ' + driveErr.message;
        }
      }

      // 2️⃣ 寫紀錄到「紀錄」工作簿
      var recSheet = ss.getSheetByName(RECORD_SHEET_NAME);
      if (!recSheet) {
        recSheet = ss.insertSheet(RECORD_SHEET_NAME);
      }
      if (recSheet.getLastRow() === 0) {
        recSheet.appendRow(['時間戳記','年度','季','處室代碼','處室名稱','確認狀態','簽名檔連結']);
      }
      recSheet.appendRow([now, nendo, ki, unitCode, unitName, '已確認', fileUrl]);

      // 3️⃣ 更新「設定」工作簿的「檢視狀態」欄，讓前端直接變色
      var settingSheet = ss.getSheetByName('設定');
      if (settingSheet) {
        var sData    = settingSheet.getDataRange().getValues();
        var sHeaders = sData[0];
        var unitColIdx = -1, statusColIdx = -1;
        
        for (var j = 0; j < sHeaders.length; j++) {
          if ((sHeaders[j] + '').trim() === '處室單位') unitColIdx = j;
          if ((sHeaders[j] + '').trim() === '檢視狀態') statusColIdx = j;
        }
        
        if (unitColIdx !== -1 && statusColIdx !== -1) {
          for (var r = 1; r < sData.length; r++) {
            var cellVal = (sData[r][unitColIdx] + '').trim();
            if (cellVal.startsWith(unitCode + '.') || cellVal === unitName || cellVal === unitCode) {
              settingSheet.getRange(r + 1, statusColIdx + 1).setValue(true);
              break;
            }
          }
        }
      }

      return jsonOut({ status: 'success', message: '簽名已儲存', fileUrl: fileUrl });
    }

    // ════════════════════════════════════════
    // 【WRITE】借還異動（原有功能保留）
    // ════════════════════════════════════════
    if (action === 'write') {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return jsonOut({ status: 'error', message: '找不到工作表: ' + sheetName });

      var now = Utilities.formatDate(new Date(), "GMT+8", "yyyy/MM/dd HH:mm:ss");
      var recordSheet = ss.getSheetByName('借用紀錄');
      if (!recordSheet) {
        recordSheet = ss.insertSheet('借用紀錄');
        recordSheet.appendRow(['時間戳記', '動作', '設備編號', '工作表', '管理教師', '所在班級', '備註', '電子簽名']);
      }
      recordSheet.appendRow([now, payload.actionType, payload.deviceIds, sheetName,
        payload.teacher, payload.location, payload.note, payload.signature]);

      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var headIdIdx = headers.indexOf('設備ID');
      if (headIdIdx === -1) headIdIdx = headers.indexOf('設備編號');
      var headStatusIdx = headers.indexOf('設備狀態');
      if (headStatusIdx === -1) headStatusIdx = headers.indexOf('目前狀態');
      var headTeacherIdx = headers.indexOf('管理教師');
      if (headTeacherIdx === -1) headTeacherIdx = headers.indexOf('借用人');
      var headMemoIdx = headers.indexOf('備註');
      var headClassIdx = headers.indexOf('所在班級');

      if (headIdIdx === -1 || headStatusIdx === -1) {
        return jsonOut({ status: 'error', message: '原始工作表缺乏 設備ID 或 設備狀態 欄位' });
      }

      var idsArray = payload.deviceIds.split(',').map(function (s) { return s.trim(); });
      for (var r = 1; r < data.length; r++) {
        if (idsArray.indexOf(data[r][headIdIdx] + '') !== -1) {
          if (payload.actionType === '借出') {
            sheet.getRange(r + 1, headStatusIdx + 1).setValue('借出中');
            if (headTeacherIdx !== -1) sheet.getRange(r + 1, headTeacherIdx + 1).setValue(payload.teacher);
            if (headMemoIdx !== -1) sheet.getRange(r + 1, headMemoIdx + 1).setValue(payload.note);
            if (headClassIdx !== -1) sheet.getRange(r + 1, headClassIdx + 1).setValue(payload.location);
          } else {
            sheet.getRange(r + 1, headStatusIdx + 1).setValue('可借用');
            if (headTeacherIdx !== -1) sheet.getRange(r + 1, headTeacherIdx + 1).setValue('');
            if (headMemoIdx !== -1) sheet.getRange(r + 1, headMemoIdx + 1).setValue('');
            if (headClassIdx !== -1) sheet.getRange(r + 1, headClassIdx + 1).setValue('');
          }
        }
      }
      return jsonOut({ status: 'success', message: '資料寫入與狀態更新成功', sheetName: sheetName });
    }

    return jsonOut({ status: 'error', message: '未知的 action: ' + action });

  } catch (error) {
    return jsonOut({ status: 'error', message: error.toString() });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
