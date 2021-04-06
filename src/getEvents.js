'use strict';
// SPECIAL THANKS TO CHANCE HARMON FOR DEMONSTRATING THE TUTORIAL.
const puppeteer = require('puppeteer');

console.log('made it into getEvents.js')
async function hitFacebook(username){
    console.log('INSIDE OF HIT FACEBOOK FUNCTION')
    // PRAYING HANDS --> THANK YOU --> THIS FUNCTION WAS TAKEN FROM STACK OVERFLOW:  https://stackoverflow.com/a/53527984/15056018
    async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
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

    let url = `https://www.facebook.com/${username}/events`;

    await page.goto(url, { waitUntil: 'networkidle2'});

    await page.setViewport({
        width:1200,
        height:800
    });

    await autoScroll(page);
    try{
        await page.click("#expanding_cta_close_button");
    } catch{
        console.error('NOT QUITE RITE')
        return `Sorry this didn\'t work quite right. Consider testing this yourself by visiting \'https://facebook.com/${username}/events you should see the events for the given username --> If you don\'t, check to ensure that the user has events, and that they are set to PUBLIC`;
    }
   
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

    let eventIdArr = rawEventUrl.reduce((acc, val) => {
        acc.push(val.slice(8, val.length-1))
        return acc;
    },[])

// OK, at this point we have an array of all the eventID's

// next we want to get the details of each event.. date formatted date with year etc.

    async function getEventDetails(eventId){
        try{

            let individualEventUrl = 'https://www.facebook.com/events/' + eventId;

            await page.goto(individualEventUrl, { waitUntil: 'networkidle2'});
        
            await page.setViewport({
                width:1200,
                height:800
            });
        
            let title = await page.evaluate(() => {
                return document.querySelector('#seo_h1_tag').textContent;
            });

            let imageUrl = await page.evaluate(()=>{
                return document.querySelector('img').src;
            });

            let dateTime = await page.evaluate(() => {
                return document.querySelector('._xkh > :first-child').textContent;
            });

            let urlsFromDescription = await page.evaluate(()=>{
                return Array.from(document.querySelectorAll('._63ew > span > a'), element => element.innerText);
            });
            // let venueName = document.querySelector('._3xd0._3slj > div > :first-child > tbody > tr > :last-child > div > div > div > :nth-child(2) > div > a').innerText;
            // let venueLocation = document.querySelector('._3xd0._3slj > div > :first-child > tbody > tr > :last-child > div > div > div > :nth-child(2) > div > div').innerText;

            let obj = {
                title,
                eventId,
                imageUrl,
                dateTime,
                urlsFromDescription,
                venueName,
                venueLocation,
            }; 
            return obj;           
        } catch {
            console.error()
        }

       
    }

    let results = [];
    for(let url of eventIdArr){
        results.push(await getEventDetails(url));
    }

    await browser.close();
    return results;

}
module.exports = hitFacebook;