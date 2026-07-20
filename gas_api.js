function doGet(e) {
  return handleResponse(e);
}

function doPost(e) {
  return handleResponse(e);
}

function handleResponse(e) {
  // 設定 CORS 標頭，允許跨域請求
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 處理 OPTIONS 請求 (CORS 預檢)
  if (e.postData === undefined && Object.keys(e.parameter).length === 0) {
     return ContentService.createTextOutput("")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    var sheetId = '1d55V0DpbvS-o9qjEw1LuULYzAR_JSKfVDpvlb7WbgnM'; 
    var sheetName = '工作表1'; // ★★★ 請修改為你的工作表名稱 ★★★
    
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createJsonResponse({ status: 'error', message: '找不到工作表: ' + sheetName });
    }

    var action = e.parameter.action;
    
    // 如果是 POST 請求，通常資料會在 postData 裡面
    if (e.postData && e.postData.contents) {
      try {
        var postData = JSON.parse(e.postData.contents);
        action = postData.action || action;
        // 將 postData 的參數合併到 e.parameter 方便後續處理
        for (var key in postData) {
          e.parameter[key] = postData[key];
        }
      } catch (err) {
        // 解析 JSON 失敗，忽略
      }
    }

    if (action === 'read') {
      return readData(sheet);
    } else if (action === 'write') {
      return writeData(sheet, e.parameter);
    } else {
      // 預設行為：讀取資料
      return readData(sheet);
    }

  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString(), stack: error.stack });
  }
}

function readData(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({ status: 'success', data: [] });
  }

  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }

  return createJsonResponse({ status: 'success', data: result });
}

function writeData(sheet, parameter) {
  // 假設前端傳來的資料放在 data 屬性中，且為 JSON 字串
  var newRowDataStr = parameter.data;
  if (!newRowDataStr) {
    return createJsonResponse({ status: 'error', message: '必須提供 data 參數' });
  }

  var newRowData;
  try {
     // 嘗試解析 JSON 字串
     newRowData = typeof newRowDataStr === 'string' ? JSON.parse(newRowDataStr) : newRowDataStr;
  } catch (e) {
      // 如果不是 JSON，嘗試將 parameter 本身當作資料
      newRowData = parameter;
      delete newRowData.action; // 移除 action 參數
  }

  var headers = sheet.getDataRange().getValues()[0];
  var rowToWrite = [];

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    rowToWrite.push(newRowData[header] || ''); // 如果資料中沒有對應的標題，則填入空字串
  }

  // 加上時間戳記 (可選)
  // rowToWrite.push(new Date()); 

  sheet.appendRow(rowToWrite);

  return createJsonResponse({ status: 'success', message: '資料寫入成功' });
}

function createJsonResponse(responseObject) {
  // 將回傳的物件轉為 JSON 字串，並設定 MimeType 為 JSON
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
