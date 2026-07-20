// ★★★ 學校平板專用 Dashboard 後台 API ★★★
// 試算表 ID 已幫你填入
var sheetId = '1d55V0DpbvS-o9qjEw1LuULYzAR_JSKfVDpvlb7WbgnM';

function doGet(e) { return handleResponse(e); }
function doPost(e) { return handleResponse(e); }

function handleResponse(e) {
  try {
    var ss = SpreadsheetApp.openById(sheetId);
    
    // 前端如果沒有傳 sheetName，預設讀取的工作表
    var sheetName = "工作表1"; 
    
    if (e.parameter && e.parameter.sheetName) {
      sheetName = e.parameter.sheetName;
    } else if (e.postData && e.postData.contents) {
      var postData = JSON.parse(e.postData.contents);
      if (postData.sheetName) sheetName = postData.sheetName;
    }

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonOut({ status: 'error', message: '找不到工作表: ' + sheetName });
    }

    var data = sheet.getDataRange().getDisplayValues();
    
    // 如果只有標題列或沒有資料
    if (data.length <= 1) {
      return jsonOut({ status: 'success', data: [] });
    }

    var headers = data[0];
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // 忽略完全空白的列
      if (row.join('').trim() === '') continue;
      
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        // 去除標題前後空白做為 key，避免打錯字
        var key = (headers[j] || '').toString().trim();
        if (key !== "") {
          obj[key] = (row[j] || '').toString().trim();
        }
      }
      result.push(obj);
    }
    
    return jsonOut({ status: 'success', data: result });
    
  } catch (error) {
    return jsonOut({ status: 'error', message: error.toString() });
  }
}

// 輸出 JSON 給前端
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
