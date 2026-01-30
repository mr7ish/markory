export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // background.js
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openTab") {
      console.log("log =>", message);

      // browser.windows.create({
      //   url: message.url,
      //   type: "normal",
      // });

      // return;
      browser.tabs.create({ url: message.url });
    }
  });
});
