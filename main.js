const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    userDataDir: path.join(__dirname, 'userdata'),
    executablePath: path.join('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  });
  const page = await browser.newPage();
  await page.exposeFunction('injectDecryptedData', (filename, buf, length) => {
    const uint8 = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      uint8[i] = buf[i]
    }
    fs.writeFile(path.resolve(__dirname, 'output4', filename), uint8, (err) => {
      if (err) {
        console.log(filename, err)
        return
      }
      fs.writeFile(path.join(__dirname, 'log'), filename, { flag: 'a' }, () => { })
    })
  });
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const url = req.url()
    let headers = req.headers()
    if (headers['sec-ch-ua']) {
      delete headers['sec-ch-ua']
    }

    if (url.includes('dmmvideo.min.js')) {
      fs.readFile(path.resolve(__dirname, 'dmmvideo.min.js'), (err, data) => {
        req.respond({
          headers: {
            ['Content-Type']: 'application/javascript'
          },
          body: data.toString()
        })
      })
      return
    }
    // else if (url.includes('/digital/-/player/=/player=html5/act=playlist')) {
    //   fs.readFile(path.resolve(__dirname, 'index.html'), (err, data) => {
    //     req.respond({
    //       headers: {
    //         ['Content-Type']: 'text/html'
    //       },
    //       body: data.toString()
    //     })
    //   })
    //   return
    // }
    req.continue({
      headers
    })
  })
  await page.goto('https://www.dmm.co.jp/digital/-/player/=/player=html5/act=playlist/pid=snis00121/view_flag=1/parent_product_id=snis00121dl6/part=1/');
  // other actions...
  // await browser.close();
})();