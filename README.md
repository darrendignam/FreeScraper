# FreeScraper

This a freecycle website scraper created with node.js express cheerio and a few other packages.
This initial version is focused on London groups but can be easily expanded and adapted for your needs. It can be seen in operation over at heroku

[http://freescraper.herokuapp.com/](http://freescraper.herokuapp.com/)

I only have a free account - so not sure how much use and abuse that link can suffer, so if you know what you are doing, perhaps run the script on your own machine. Node.js can be installed on all your favorite operating systems and you can have your own personal version always there. I suspect that the freecycle webpage temporarily blocks IP addresses that ask too much of it (so the heroku app may get blocked if lots of people all try and scrape all the time - where this is les likely from your own laptop).


## Node.js
[Installing Node.JS](https://nodejs.org/en/download/)

This is a node application - so use git or the zip file to get the source code files onto your local machine. You should then be able to follow the standard node installation and be up and running (assuming you have nodejs correctly setup on your system):

```
cd FREESCRAPER_SOURCE_FOLDER
npm install
node app.js
```

You should now be up and running and can access the application by going to your web browser and going to somethine like
```
http://172.0.0.1:3000/
```

## How it works

The homepage helps you navigate to one of the three scripts that can scrape freecycle. The main script fc_2 will display a long list (about 3000 offered items) from all the London groups. The other scripts are a bit experimental and are a variation on fc_2. One will attempt to get the additional metadata from the items (time, date, description, image) but this can crash the script when there are too many items - so should only be used on smaller subsets of freecycle groups.

I find the mega list is more useful for looking for items, as you can Commad-F / CTRL-F that page and find all the 'desks' on offer in London. The detailed view is a bit similar to what freecycle already offer. There is a script that combines a few of the north London detailed responses together that is a bit more useful than the official freecycle site.

the actual scraping scripts can be found in the routes/ folder within the app. With fc_ names. 

## What next?

The code is very simple, and could do with a lot of improvement. If you look at the code you can easily see whats going on - even if you have never used node or javascript before, and you can easily tweak and fiddle to get the response you want. Read through fc_2 fc_3 and fc_6 in taht order and I think you will have a good idea of whats going on.

The next step would be to start saving items into a database and regularly scraping for new additions to the freecycle groups. Then searches would be against the database - not the actual freecycle site. Which would speed things up, and reduce the burden on the freecycle servers, as the scrape can be a bit intense perhaps?

If anyone does make these or other improvements - then please share them back with the rest of us, or if you host this app somewhere please let us know too.

I imagine I have a load of bugs and spelling errors and I look forward to you telling me all about them!!
