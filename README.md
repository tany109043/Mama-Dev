# Mama-Dev (Udemy Floating Widget 📘)

This widget tracks your progress on any Udemy course without needing API access.

## ✅ Features
- Scrapes title, modules, and durations
- Allows manual progress tracking
- Stores progress in browser
- Loads as a floating button on any Udemy page

## 🚀 Use It as a Bookmarklet
Create a bookmark with this code:

```js
javascript:(function(){
  var s=document.createElement('script');
  s.src='https://yourusername.github.io/udemy-widget/';
  document.body.appendChild(s);
})();
