# Real Time Chat
Back & frontend chat written with express-js
## Gettings started:
```bash
npm install
```
#### to run the server:
```bash
node .
```
dont forget to edit the config files!
## usage:
#### config:
here you can change the settings to your liking.  
```toml
[server]
ip = "127.0.0.1"
port = 3000
timezone = "Australia/Melbourne"

[frontend]
dir = "./public"
```
#### version settings
this controls the changelog, and overall version that the frontend displays
```toml
version = "2.2.5"

[changelog."one"]
changes = "example" 

[changelog."two"]
changes = "example"

[changelog."three"]
changes = "example"
```