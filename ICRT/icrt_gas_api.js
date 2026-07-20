function doGet(e) {
  // 設定 CORS 標頭，允許跨域請求
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // 你的試算表 ID
    var sheetId = '1oSAonWYuZ0G7LF9XSXdjDo11JT8AbDmOHB8jJ0QCpBc'; 
    var ss = SpreadsheetApp.openById(sheetId);
    
    var action = e.parameter.action;
    
    if (action === 'getAudioList') {
      var sheetName = e.parameter.sheet || '音訊'; // 預設工作表名稱，可從前端傳入
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return createJsonResponse({ status: 'error', message: '找不到音訊工作表: ' + sheetName });
      
      var data = sheet.getDataRange().getValues();
      var result = [];
      // 假設第一列是標題，從第二列開始讀取 (i=1)
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] !== "") { // 標題不為空才加入
          result.push({ 
             title: data[i][0], 
             url: data[i][1] 
          });
        }
      }
      return createJsonResponse({ status: 'success', data: result });
    }
    
    else if (action === 'getSubtitles') {
      var sheetName = e.parameter.sheet || '字幕'; // 預設工作表名稱，可從前端傳入
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return createJsonResponse({ status: 'error', message: '找不到字幕工作表: ' + sheetName });
      
      var data = sheet.getDataRange().getValues();
      var result = [];
      // 字幕通常直接貼上，所以從第一列 (i=0) 開始讀取 A 欄
      for (var i = 0; i < data.length; i++) {
        var text = data[i][0] ? data[i][0].toString().trim() : "";
        if (text !== "") {
          result.push(text);
        }
      }
      return createJsonResponse({ status: 'success', data: result });
    }
    
    else {
      return createJsonResponse({ status: 'error', message: '不支援的 action 參數' });
    }

  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function createJsonResponse(responseObject) {
  var output = ContentService.createTextOutput(JSON.stringify(responseObject));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
