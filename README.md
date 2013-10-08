Giving-Tree
===========

Help schools or community associations raise funds through Amazon referral program and Wishlists. This was built with a school in mind but could work with any organization.

Right now this is specific to Google Chrome but it can be adapted to Safari (in the works).

Overview
--------

My daughters school uses Amazon Refferal Program to raise money for the school. They asked parents to use a Bookmark which works pretty well. However I thought browser extension would be easier becuase:

- You don't have to always re-visit a bookmark
- You can installit once and forget about it
- It can do more

The extension does many things things: Refferal Tags and Wishlists.

Referral Tags
-------------

- Re-writes all Amazon product links you ever encounter to include a schools Refferal Code

Note: This will also over-write other peoples referral codes!

Wish Lists
-----------

- Allow a school to add Wishlists for each class, and the user (parent, grand-parent, guardian, friend etc) can designate which one they want to default to.
- That Wishlist is then added within the Amazon Site and also within the Wishlist Menu.

Setup & Configuration
=====================

Amazon
------

You will need an Amazon Refferal code and means you'll need to enroll in Amazons program.

https://affiliate-program.amazon.com/

Which gives me this Affiliate Code:

  ps321org0c-20

Enter that in the config.js

Wishlists
---------

Right now it expects Wishlist information. I imagine an update will make this optional and better handled.

Since this is meant to handle a high number of Wishlists for class rooms in a school, I thought it best to manage this through a Google Spreadhseet. The extension checks for changes every day - this should be adjusted as necesary depending on how often you expect it to be updated.

Setup your spreadsheet:

- Create a new Spreadsheet in Google Drive by copying this one (the Columns matter):
  - https://docs.google.com/spreadsheet/ccc?key=0AjysYYjJHCE5dFV1Vmp5TW5ZZVVaVmtEcG5wV1kwRXc&usp=sharing
- Go to File > Publish to the web…
- Choose “All sheets" or just one sheet depending on what you’re planning to do
- Click Close
- Copy the key value from the URL. It will look like this 0AjysYYjJHCE5dFoya0RQVGxoVHJyYlpzLXhJVmh1V2c
- Update config.js with the key value

Compile Extension
=================

First, you need to test before you compile. Start here:

  http://developer.chrome.com/extensions/getstarted.html#unpacked

Once you've tested it, you'll need to upload it to the Webstore in order for it to be distributed.

  https://developers.google.com/chrome/web-store/docs/publish

You'll need to create a Developer Account and such. Instructions are pretty detailed.

Once uploaded to the Chrome Webstore its then ready for distribution.


  





