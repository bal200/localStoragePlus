/*****
 ***** localStoragePlus is a Replacement for the browsers localStorage functions,
 ***** specifically for use with Cordova, because your apps localStorage can be
 ***** wiped when a phone's storage is low.
 ***** v1.0.0
 *****/

var LocalStoragePlus = function() {
  var name = "localStoragePlus"; /* websql database name */
  var estSize = 128 *1024;  /* bytes.  User is asked to extend if it exceeds this */
  var ver = "1.0";  /* database version */

  this.length=0;
  this.pending = [];
  /* pending[x]: sqlStatement string */

  this.cache = [];
  /* cache[x]: {key, value} */

  this.executing = 0; /* 1 means currently executing sql at top of pending queue */

  this.db = window.openDatabase(name, ver, name, estSize);
  if (this.db){
    this.executing=1;
    var self=this;
    this.db.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS localStoragePlus (key text primary key, value text)", [],
        function (tx, results) {
          console.log("LocalStoragePlus: Successfully opened Database");
          self.executing=0;
          self.loadCache();
        }, function(err){
          console.log("LocalStoragePlus: error initialising the websql database "+ err.message);
          self.executing=0;
        });
    });
  }
}

LocalStoragePlus.prototype.loadCache = function() {
  this.executing=1;
  var self=this;
  this.db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM localStoragePlus', [], function (tx, results) {
      for (i=0; i < results.rows.length; i++){
        self.cache.push({key:   results.rows.item(i).key,
                         value: results.rows.item(i).value});
        //console.log(i+" loaded key:"+results.rows.item(i).key+" val:"+results.rows.item(i).value);
      }
      self.executing=0;
      this.length=results.rows.length;
      console.log("LocalStoragePlus: Loaded "+results.rows.length+" keys from DB.");
    }, function (err) {
      console.log("localStoragePlus: "+err.message);
      self.executing=0;
    });
  });
}

LocalStoragePlus.prototype.setItem = function(key, value) {
  var index=-1, sqlStatement;
  for (n=0; n<this.cache.length; n++) {
    if (key == this.cache[n].key) {
      this.cache[n].value = value;
      index=n; break;
    }
  }
  if (index==-1){ /* didnt exist, so its a INSERT  */
    this.cache.push({key: key, value: value});
    this.length++;
    sqlStatement = 'INSERT INTO localStoragePlus (key, value) '
                 + 'VALUES ("'+key+'", "'+value+'")';
  }else{ /* the key already exists, so UPDATE  */
    sqlStatement = 'UPDATE localStoragePlus SET value="'+value+'" '
                 + 'WHERE key="'+key+'";';
  }
  this.pending.push(sqlStatement);
  console.log("LocalStoragePlus: saved "+key);

  this.dbTrans();
}

LocalStoragePlus.prototype.getItem = function(key) {
  for (n=0; n<this.cache.length; n++) {
    if (key == this.cache[n].key) {
      console.log("LocalStoragePlus: retrieved key "+key);
      return this.cache[n].value;
    }
  }
  return null;
}

LocalStoragePlus.prototype.removeItem = function(key) {
  var sqlStatement;
  for (n=0; n<this.cache.length; n++) {
    if (key == this.cache[n].key) {
      this.cache.splice(n, 1);
      this.length--;
      sqlStatement = 'DELETE FROM localStoragePlus '
                   + 'WHERE key="'+key+'";';

      this.pending.push(sqlStatement);
      console.log("LocalStoragePlus: removed "+key);
      this.dbTrans();
    }
  }
}
LocalStoragePlus.prototype.clear = function() {
  while (this.cache.length >0) {
    this.removeItem(this.cache[0].key);
  }
}

LocalStoragePlus.prototype.dbTrans = function() {
  if (this.pending.length >0 && this.executing==0) {
    this.executing = 1; /* mutual exclusive lock */
    var sqlStatement = this.pending[0];
    var self=this;
    this.db.transaction(function (tx) {
      tx.executeSql(sqlStatement, [],
      function (tx, result) {
        /*** SUCCESS **/
        console.log("LocalStoragePlus: Successfully saved an item to DB");
        self.pending.splice(0, 1); /* remove from pending queue array */
        self.executing=0;

        if (self.pending.length>0) { /* any more waiting? */
          self.dbTrans();
        }

      }, function (err) {
        /*** ERROR ***/
        console.log(err.message);
        /* todo: retry? */
        self.executing=0;
      });
    });
  }
}

LocalStoragePlus.prototype.migrateLocalStorage = function( todo ) {
  var ls = window.localStorage;
  console.log("LocalStoragePlus: migrating localStorage to localStoragePlus");
  if (typeof(todo)=='string')  todo = [todo];

  for(var i=0; i<ls.length; i++) {
    var key = ls.key(i);
    var value = ls[key];
    //console.log(key + " => " + value);
    if (!todo || (todo.indexOf(key) != -1)) { /* check it's an item we're migrating  */
      if (this.getItem(key) == null) { /* dont overwrite it if it exists already */
        this.setItem(key, value);
      }
    }
  }
}


var localStoragePlus = new LocalStoragePlus();
