
function countItemsInHistory() {
  var oneDayAgo = new Date();
  var startTime = oneDayAgo.setHours(0,0,0,0)


  var query = {text: 'facebook', startTime: startTime, endTime: Date.now()};
  chrome.history.search(query, function(results) {
    totalVisitCount = results.reduce((acc, item) => acc + item.visitCount, 0);
    console.log(totalVisitCount)

    chrome.storage.local.get(['totalFacebookAccessCount'], function(data) {
      cnt = totalVisitCount - data.totalFacebookAccessCount

      chrome.browserAction.setBadgeText(
        {
          text: cnt.toString()
        }
      )

      if (cnt > 50) {
        chrome.browserAction.setBadgeBackgroundColor({
          color: "#FF0000"
        })
      } else if (cnt > 20 && cnt < 50) {
        chrome.browserAction.setBadgeBackgroundColor({
          color: "#FFBF00"
        })
      } else if (cnt <= 20) {
        chrome.browserAction.setBadgeBackgroundColor({
          color: "#404042"
        })
      }
    });
  });
}
chrome.tabs.onCreated.addListener(function() {
  scheduleNextReset();
  countItemsInHistory()
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  scheduleNextReset();
  countItemsInHistory()
});

function scheduleNextReset() {
  var oneDayAgo = new Date();
  oneDayAgo.setHours(0,0,0,0)

  var startTime = oneDayAgo.getTime();
  var query = {text: 'facebook', startTime: startTime, endTime: Date.now()};
  chrome.history.search(query, function(results) {
    var totalVisitCount = results.reduce((acc, item) => acc + item.visitCount, 0);

    chrome.storage.local.get(['nextResetAt', 'totalFacebookAccessCount'], function(data) {
      resetTime = Date.parse(data.nextResetAt)
      totalFacebookAccessCount = parseInt(data.totalFacebookAccessCount)
      if (totalFacebookAccessCount == 0 || Date.now() > resetTime || resetTime == undefined || resetTime.toString() == 'NaN' ) {
        var oneDayLater = new Date();
        oneDayLater.setDate(oneDayLater.getDate() + 1);
        oneDayLater.setHours(0,0,0,0)

        chrome.storage.local.set({'totalFacebookAccessCount': totalVisitCount}, function() {
          console.log('Value totalFacebookAccessCount is set to ', totalVisitCount);
        });

        chrome.storage.local.set({'nextResetAt': oneDayLater.toString()}, function() {
          console.log('Value nextResetAt is set to ', oneDayLater.toString());
        });
      }
    })
  });
}

scheduleNextReset();
