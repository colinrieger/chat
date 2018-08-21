# Phoenix/Elixir chat app
### Demo
[`https://chat.colinrieger.com/`](https://chat.colinrieger.com/)

### Setup
- Install Elixir/Erlang/Hex/Phoenix/Node.js/inotify-tools/PostgreSQL.  
  [Overview](https://hexdocs.pm/phoenix/installation.html)  
  [Elixir/Erlang](https://elixir-lang.org/install.html)
  ```
  wget https://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb
  sudo dpkg -i erlang-solutions_1.0_all.deb  
  sudo apt-get update  
  sudo apt-get install esl-erlang  
  sudo apt-get install elixir  
  rm erlang-solutions_1.0_all.deb
  ```
  [Hex](https://hexdocs.pm/phoenix/installation.html#elixir-1-4-or-later)
  ```
  mix local.hex
  ```
  [Phoenix](https://hexdocs.pm/phoenix/installation.html#phoenix)
  ```
  mix archive.install https://github.com/phoenixframework/archives/raw/master/phx_new.ez
  ``` 
  [Node.js](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
  ```
  sudo apt-get install nodejs
  ```
  [inotify-tools](https://github.com/rvoicilas/inotify-tools/wiki)
  ```
  sudo apt-get install inotify-tools
  ```
  [PostgreSQL](https://wiki.postgresql.org/wiki/Detailed_installation_guides)
  ```
  sudo apt-get install postgresql postgresql-contrib
  ```
- Clone Repository
  ```
  git clone https://github.com/colinrieger/chat.git
  ```
- Install Dependencies
  ```
  cd chat
  mix deps.get
  mix deps.compile
  cd assets && npm install && node node_modules/brunch/bin/brunch build && cd $OLDPWD
  ```
- Configure Database
  ```
  mix ecto.create
  ```
- Run Server
  ```
  mix phx.server
  ```
  [http://localhost:4000/](http://localhost:4000/)
