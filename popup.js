chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      message.innerText = request.source;
    }
  });
  function cleanXmlChars(input) {
    var NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;
    return input.replace(NOT_SAFE_IN_XML_1_0, '');
};
function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
};
function callSummariser(content,summary) {
  var result = '';
  //Clean the Content
  var text = content.innerText;
  text = cleanXmlChars(text);
  text = text.replace(/[\n\r]+/g, ' ');
  text = text.replace(/&/g,"&amp;");
  text = text.replace(/</g,"&lt;");
  text = text.replace(/>/g,"&gt;");
  text = text.replace(/"/g,"&quot;");
  text = text.replace(/'/g,"&apos;");
  text = text.replace(/\[\d*\]/g, ' ');
  text = text.replace( /\.(?=[^\d])[ ]*/g , '. ')
  //Now create the request
  var command = text;
    
    //now do the post
    var url = 'http://127.0.0.1:8000/process_text/';
    //var result = "";
    var formdata = new FormData();
    formdata.append("text",command);
    formdata.append("model_id", "fbe8b2a8-4a07-488e-b7a2-0c39b38812b3");
    formdata.append("window_size", "255");
    formdata.append("window_slide", "125");
    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };
    fetch("http://127.0.0.1:8000/process_text/", requestOptions)
    .then(response => response.json())
    .then(data => {
      console.log('Response ',data)
      //Now get the text values
      var process_results = data.process_results
      console.log('Process Results',process_results)
      //Now loop through all of the results and build some dictionaries
      
      var topics = {}
      var arrayLength = process_results.length;
      var xValues = []
      for (var i=0;i < arrayLength; i++){
        //Now get the topics
        //Add the window position
        xValues.push(i)
        //Get the first list of topics
        var ts = process_results[i].Topics;
        var cs = process_results[i].Scores;
        console.log('ts',ts)
        var tsl = ts.length;
        for (var ct=0;ct < tsl;ct++) {
          //see if it's in the dictionary
          console.log('Current Topic',ts[ct])
          if (ts[ct] in topics) {
            //add the value
            topics[ts[ct]].push([process_results[i].Scores[ct]]);
          }
          else {
            //add it to the dictionary
            topics[ts[ct]] = [process_results[i].Scores[ct]];
          }
        }
      }
      console.log('Topics', JSON.stringify(topics))
      //var xValues = [50,60,70,80,90,100,110,120,130,140,150];
      var yValues = [7,8,8,9,9,9,10,11,14,14,15];
      //Now save the plot data to objects
      var plotData = []
      Object.entries(topics).forEach(([key,value]) => {
        current_topic = {};
        current_topic['label'] = key;
        current_topic['fill'] = false;
        current_topic['lineTenstion'] = 0;
        current_topic['data'] = value;
        var colour = random_rgba();
        current_topic['backgroundColor'] = colour;
        current_topic['borderColor'] = colour;
        plotData.push(current_topic);
      });
      

new Chart("myChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: plotData
  },
  options: {
    legend: {display: true},
    scales: {
      yAxes: [{ticks: {min: 0, max:100}}],
    }
  }
});
    })
    .then(
      result => console.log(result))
    .catch(error => console.log('error', error));
}

 
  function onWindowLoad() {
  
    var message = document.querySelector('#message');

    var summary = document.querySelector('#summary');
    
    chrome.tabs.executeScript(null, {
      file: "getPagesSource.js"
    }, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error running the script : \n' + chrome.runtime.lastError.message;
      }
      else {
        var magellanResult = callSummariser(message,summary);
      }
    });
  }
  
window.onload = onWindowLoad;







