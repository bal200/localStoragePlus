# localStoragePlus
Replacement for the browsers localStorage functions, specifically for use with Cordova on iOS where localStorage can be lost in low 
memory conditions.

localStorage is a quick and easy way to store a couple of strings in a Cordova app that you need to persist if the app is closed.  
But i've recently discovered it can get blanked on iOS devices that run out of storage.  Its not as persistent as 
you'd think!

So to get around this flaw, I've created this drop in replacement to localStorage for my app.  It implements the same commands that
localStorage does, but it uses WebSQL in the background to securly store your data.

There are various other methods to store stuff, but all are more complex for simple key/value storage.  This has fixed the issue for
my app, and I'll leave it here for anyone else.  Enjoy!


