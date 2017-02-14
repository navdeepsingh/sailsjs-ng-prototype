# Sailsjs + Mongodb + Angularjs 

### Database Management System

Sailsjs is a node framework works with MySQL to NoSQL (MongoDB) with conjunction with Angularjs. 

### Installation
```sh
$ git clone https://github.com/navdeepsingh/sailsjs-ng-prototype.git
$ cd mailer

```

### Steps to setup
```sh
1. npm install

2. // Use mongoimport to import Database Schema into your Mongo Server 
mongoimport --db mailer --collection user --file user.json

3. $ sails lift

4. http://localhost:1337/ Here you GO
```
### Admin Panel ###

Username : publicis@gmail.com  
Password : pub_admin

### Sample Files
```sh
 1. For Participants Import
    Test.csv in ~db folder

2. For Confirm Template
   confirm.ejs and confirm_thumb.jpg in ~db folder

3. For Email Template
   email.ejs and email_thumb.jpg in ~db folder
```
PS :  Click the thumbnail image to activate the template.

Thanks