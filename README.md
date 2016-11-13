# localStoragePlus
Replacement for the browsers localStorage functions, specifically for use with Cordova,
where localStorage can be wiped when a phone is low on storage.

localStorage is a quick and easy way to store some simple strings in a Cordova app that you need
to persist if the app is closed.  Examples are app settings, cached data, users ids, etc.  But
i've recently discovered that localStorage can get blanked on iOS devices that run out of storage.  Its not as persistent as you'd like!

So to get around this flaw, I've created this drop in replacement to localStorage for my app.
It implements the same commands that localStorage does, but it uses WebSQL internally to
securly store your data.

There are various other methods to store stuff, but all are more complex for simple key/value
storage.  This has fixed the issue for my app, and I'll leave it here for anyone else.  Enjoy!

#Usage#

Download and include the single javascript file in your Cordova app:
```
<script src="lib/localStoragePlus.js"></script>
```

This defines a new object called localStoragePlus.  Use it with the same command call syntax
as localStorage:

```javascript
localStoragePlus.setItem('user', 'bob');

var user = localStoragePlus.getItem('user');   // returns 'bob'

localStoragePlus.removeItem('user');
```
additionally, you can also:
```
for n=0; n < localStoragePlus.length; n++) {
  key = localStoragePlus.key( n );
  // ...
}

```
Key/value pairs stored with localSoragePlus are now safe on an iPhone with low storage.

#Migration from localStorage#

For existing apps, you can move all your data over from localStorage to localStoragePlus with
the migrateLocalStorage command.  This will copy each key/value pair over. It can be run at the
start of your app when you release a new version.  It will only copy keys that don't already
exist in localStoragePlus already, so you wont overwrite data if the migration is run twice.

```
if (localStoragePlus.getItem('migrationDone') == null) {
  localStoragePlus.migrateLocalStorage();
  localStorage.clear(); // you might want to avoid unnecessary duplicate data, Test well first!
  localStoragePlus.setItem('migrationDone', 'yes');
}
```
You then can search and replace localStorage for localStoragePlus throughout your app.

#Not implemented#

There are some additional methods of accessing the original localStorage that are not
implemented in localStoragePlus.

 - You cannot access items with the dot operator,  Eg. `localStoragePlus.user = 'bob';` will not work.
   You will need to use setItem or getItem instead.
 -
