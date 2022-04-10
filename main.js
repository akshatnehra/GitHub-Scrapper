const url = "https://github.com/topics";
const axios = require('axios');
const fs = require("fs");
const pdf = require("pdfkit");
const path = require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let data = [];


axios.get(url)
  .then(function (response) {
    // handle success
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    let banners = document.querySelectorAll(".no-underline.d-flex.flex-column.flex-justify-center");
    
    let topicName = document.querySelectorAll(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");

    for(let i=0; i<banners.length; i++){
        let link = "https://github.com" + banners[i].href;
        console.log(topicName[i].textContent.trim());
        openRepo(link, topicName[i].textContent.trim());
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })

  function openRepo(link, topicName){
    axios.get(link)
        .then(function (response) {
            // handle success
            const dom = new JSDOM(response.data);
            const document = dom.window.document;
            let repos = document.querySelectorAll(".f3.color-fg-muted.text-normal.lh-condensed a:nth-child(2)");
            
            for(let i=0; i<8; i++){

                let newLink = "https://github.com" + repos[i].href;
                // console.log("       "+newLink);
                openIssues(newLink, topicName);

            }
        })
        .catch(function (error) {
            // handle error
        
        })
  }

  function openIssues(link, topicName){
    axios.get(link)
        .then(function (response) {
            // handle success
            const dom = new JSDOM(response.data);
            const document = dom.window.document;
            let issue = document.querySelector("#issues-tab");

            if(issue == null || issue == undefined)
                return;

            let newLink = "https://github.com" + issue.href;
            // console.log(newLink);

            storeIssues(newLink, topicName);            
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
  }

  function storeIssues(link, topicName){
    axios.get(link)
        .then(function (response) {
        // handle success
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        let individualIssues = document.querySelectorAll(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
        
        for(let i=0; i<10; i++){
            // console.log(individualIssues[i].textContent);
            let issueDetails = {};
            if(individualIssues[i] == null || individualIssues[i] == undefined)
                continue;
            issueDetails.topicName = topicName;
            issueDetails.issueName = individualIssues[i].textContent;
            issueDetails.issueLink = "https://github.com" + individualIssues[i].href;
            data.push(issueDetails);
        }

        // console.table(data);

        let json = JSON.stringify(data);
        fs.writeFileSync("data.json", json, "utf-8");

        const doc = new pdf();
        let outputPath = path.join("OutputFiles",topicName+'.pdf');
        doc.pipe(fs.createWriteStream(outputPath));
        // doc.text(json);
        for(let i=0; i<data.length; i++){
            if(data[i].topicName == topicName){
                doc.text(data[i].topicName);
                // doc.text(data[i].issueName);
                // doc.text(data[i].issueLink);
                doc.text(data[i].issueName, {
                    link: data[i].issueLink,
                    underline: true
                  });
                doc.text("\n");
            }
        }
        doc.end();
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
  }