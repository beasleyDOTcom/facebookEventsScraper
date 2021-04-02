'use strict';
// SPECIAL THANKS TO CHANCE HARMON FOR DEMONSTRATING THE TUTORIAL.
const puppeteer = require('puppeteer');
(async () => {
    // PRAYING HANDS --> THANK YOU --> THIS FUNCTION WAS TAKEN FROM STACK OVERFLOW:  https://stackoverflow.com/a/53527984/15056018
    async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36');
    let username = 'beasleydotcom';
    let url = 'https://www.facebook.com/beasleydotcom/events';

    await page.goto(url, { waitUntil: 'networkidle2'});

    await page.setViewport({
        width:1200,
        height:800
    });

    await autoScroll(page);

    await page.click("#expanding_cta_close_button");
   
//  SELECT ONE
    // let showWithMelanie = await page.evaluate(() => {
    //     // return document.querySelector('.emergencybanner > p').textContent;
    //     return document.querySelector('._51mx').textContent;
    // })
    // console.log(showWithMelanie);
//  SELECT ALL
    let rawEventUrl = await page.evaluate(() => {
// TWO WAYS OF ACHEIVING THE SAME THING:
        // let urls = Array.from(document.querySelectorAll('._51mx> :nth-child(2) > div > div > a '), element => element.href)
        // return urls;
        let arrayOfEventUrls = [...document.querySelectorAll('._51mx > :nth-child(2) > div > div > a')].map(url => url.href)
        return arrayOfEventUrls;
    })
    let regex = /\/events\/\d+\//gi
    rawEventUrl = rawEventUrl.map(url => url.match(regex)[0]); // adding the [0] prevents creating unnecessary nesting of arrays. 

    let eventID = rawEventUrl.reduce((acc, val) => {
        acc.push(val.slice(8, val.length-1))
        return acc;
    },[])
    // OK, at this point we have an array of all the eventID's


// next we want to get the formatted date with year




    await browser.close();

})();