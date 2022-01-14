'use strict';
// SPECIAL THANKS TO CHANCE HARMON FOR DEMONSTRATING THE TUTORIAL.
const puppeteer = require('puppeteer');

console.log('made it into getEvents.js')
async function hitFacebook(username) {
    console.log('INSIDE OF HIT FACEBOOK FUNCTION')
    // PRAYING HANDS --> THANK YOU --> THIS FUNCTION WAS TAKEN FROM STACK OVERFLOW:  https://stackoverflow.com/a/53527984/15056018
    async function autoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
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

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.setViewport({
        width: 1200,
        height: 800
    });
    // page.on('console', async msg => {
    //     // serialize my args the way I want
    //     const args = await Promise.all(msg.args.map(arg => arg.executionContext().evaluate(arg => {
    //       // I'm in a page context now. If my arg is an error - get me its message.
    //       if (arg instanceof Error)
    //         return arg.message;
    //       // return arg right away. since we use `executionContext.evaluate`, it'll return JSON value of
    //       // the argument if possible, or `undefined` if it fails to stringify it.
    //       return arg;
    //     }, arg)));
    //     console.log(...args);
    //   });
    //   console.log(" after new console dealio from stack overflow contributor");

    // from https://devdocs.io/puppeteer/index#event-console

    page.on('console', msg => console.log("********************" + msg.args()));

    await autoScroll(page);
    // try{
    //     await page.click("#expanding_cta_close_button");
    // } catch{
    //     console.error('NOT QUITE RITE')
    //     return `Sorry this didn\'t work quite right. Consider testing this yourself by visiting \'https://facebook.com/${username}/events you should see the events for the given username --> If you don\'t, check to ensure that the user has events, and that they are set to PUBLIC`;
    // }
    console.log('made it to line 49');

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

    let arrayOfEventObjects = rawEventUrl.reduce((acc, val) => {
        acc.push({ ID: val.slice(8, val.length - 1) })
        return acc;
    }, [])
    console.log("Event Id's " + arrayOfEventObjects);
    // to test the gathering of event id's related to a particular username uncomment the next couple lines so to return just these results.
    // await browser.close();
    // return eventIdArr;


    // OK, at this point we have an array of all the eventeventID's
    // next we want to 
    // next we want to get the details of each event.. date formatted date with year etc.

    async function getEventDetails(eventObj) {
        // let title ;
        // let imageUrl;
        // let dateTime;
        // let urlsFromDescription;
        // let venueName;
        // let venueUrl;
        try {

            let individualEventUrl = 'https://www.facebook.com/events/' + eventObj.ID;
            console.log("this is the individual event url: " + individualEventUrl);

            await page.goto(individualEventUrl, { waitUntil: 'networkidle2' });
            console.log("made it past page.goto ");
            await page.setViewport({
                width: 1200,
                height: 800
            });

            eventObj.individualEventUrl = individualEventUrl;

            eventObj.title = await page.evaluate(() => {
                return document.querySelector('#seo_h1_tag').textContent;
            });
            console.log("title: " + eventObj.title)
            eventObj.pageTitle = await page.evaluate(() => {
                return document.querySelector('#pageTitle').textContent;
            })
            console.log("this is pageTitle:    " + eventObj.pageTitle);
            
            eventObj.imageUrl = await page.evaluate(() => {
                return document.querySelector('img').src;
            });
            console.log("image url: " + eventObj.imageUrl);

            // get preview image
            eventObj.previewImage = await page.evaluate(() => {
                return document.querySelector('meta[property="og:image"]').content;
            })
            console.log("PREVIEW IMAGE: " + eventObj.previewImage);
            
            console.log('RESULTS:                                     ' + await page.evaluate(() => {
                return document.querySelector('._xkh > :first-child').textContent;
            }))
            eventObj.dateTime = await page.evaluate(() => {
                return document.querySelector('._xkh > :first-child').textContent;
            });
            console.log("datetime: " + eventObj.dateTime);

            eventObj.urlsFromDescription = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('._63ew > span > a'), element => element.innerText);
            });
            console.log("urlsFromDescription: " + eventObj.urlsFromDescription);
            eventObj.venueName = await page.evaluate(() => {
                return document.querySelector('._xkh > a').textContent;
            });

            eventObj.venueUrl = await page.evaluate(() => {
                return document.querySelector('._xkh > a').href;
            });

            // console.log("88888888888888888888888 " + eventObj.venueName + "((((((((((((((((((((" + eventObj.venueUrl)
            // console.log("this are the details of an event: " + obj);
        } catch {
            console.error("error in getEventDetails with eventId: " + eventObj + " title: " + eventObj.title + "eventId: " + eventObj.ID +
                "image url: " + eventObj.imageUrl + " datetime: " + eventObj.dateTime + " urlsFromDesc: " + eventObj.urlsFromDescription + "venueName: " + eventObj.venueName + " venueLocation: " + eventObj.venueUrl);
        }
        return eventObj;
    }

    let results = [];
    for (let event of arrayOfEventObjects) {
        results.push(await getEventDetails(event));
    }
    for (let i = 0; i < results.length; i++) {
        if (results[i] === undefined) {
            console.log(arrayOfEventObjects[i])
        }
    }
    await browser.close();
    return results;

}
module.exports = hitFacebook;