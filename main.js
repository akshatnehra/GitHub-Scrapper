const url = "https://github.com/topics";
const axios = require('axios');
const fs = require("fs");
const pdf = require("pdfkit");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let data = [];


axios.get(url)
  .then(function (response) {
    // handle success
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    let banners = document.querySelectorAll(".no-underline.d-flex.flex-column.flex-justify-center");
    
    for(let i=0; i<banners.length; i++){
        let link = "https://github.com" + banners[i].href;
        console.log(link);

        openRepo(link);
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })

  function openRepo(link){
    axios.get(link)
        .then(function (response) {
            // handle success
            const dom = new JSDOM(response.data);
            const document = dom.window.document;
            let repos = document.querySelectorAll(".f3.color-fg-muted.text-normal.lh-condensed a:nth-child(2)");
            
            for(let i=0; i<8; i++){

                let newLink = "https://github.com" + repos[i].href;
                // console.log("       "+newLink);
                openIssues(newLink);

            }
        })
        .catch(function (error) {
            // handle error
        
        })
  }

  function openIssues(link){
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

            storeIssues(newLink);            
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
  }

  function storeIssues(link){
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
            issueDetails.issueName = individualIssues[i].textContent;
            issueDetails.issueLink = individualIssues[i].href;
            data.push(issueDetails);
        }

        console.table(data);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
  }