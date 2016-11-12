# localStoragePlus
Replacement for the browsers localStorage functions, specifically for use with Cordova on iOS where localStorage can be lost in low 
memory conditions.

localStorage is a quick and easy way to store a couple of strings in a Cordova app that you need to persist if the app is closed.  
But i've recently discovered it can get blanked on iOS devices that run out of storage.  Its not as persistent as 
you'd think!

So to get around this flaw, I've created this drop in replacement to localStorage for my app.  It implements the same commands that
localStorage does, but it uses WebSQL internally to securly store your data.

There are various other methods to store stuff, but all are more complex for simple key/value storage.  This has fixed the issue for
my app, and I'll leave it here for anyone else.  Enjoy!

#Usage#

Download and include the single javascript file in your Cordova app:
```
<script src="lib/localStoragePlus.js"></script>
```

This defines a new object called localStoragePlus.  Use it with the same command call syntax as localStorage:

```javascript
localStoragePlus.setItem('user', 'bob');

var user = localStoragePlus.getItem('user');   // user == 'bob'

localStoragePlus.removeItem('user');

```

Key/value pairs stored in localSoragePlus are safe on iPhones with low storage.

