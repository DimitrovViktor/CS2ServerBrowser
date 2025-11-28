# CS Server Browser

A CS(Counter Strike) server browser with live server information (player count etc.), server customization and daily clips. 


![Main Page](https://github.com/user-attachments/assets/07524740-744a-462b-b9a1-e6416b76a94a)

---

## Pages and components

### 0. Nav bar

![Nav Bar](https://github.com/user-attachments/assets/d9594e1a-bd4c-46c2-b858-32a5859d9b0e)

 - **Pages**

 Servers - allows the user to look at all registered servers
 My Servers - allows the user to create, edit and look at their own servers (works only for registered users)
 Options - allows the user to modify their settings for the website (currently in development)
 Daily Clip - allows the user to look at the daily clip submitted by another user (currently in development)

- **Nav bar Components**

- Search bar for servers (currently in development)
- Filter button (currently in development)
- Statistics button - displays real time server statistics for the website (shows live players and live servers)
- Profile button - allows the user to log in/register via a modal
- Login/Registration modal
  
![Registration Modal](https://github.com/user-attachments/assets/2202ebea-4097-4cbb-9d14-01ec022ffcf1)

![Login Modal](https://github.com/user-attachments/assets/34280ce6-1ec6-411c-b427-2e2202bab51a)

  - The user can log in/register using steam, google and discord (currently in development)
  - Registration requires the user to give the following information:
    - Username
    - Email
    - Password
    - Repeat Password
  - Login requires the user to give the following information:
    - Email/Username
    - Password

### 1. Server list

![Server List](https://github.com/user-attachments/assets/bd241c15-ccb5-41e6-8c98-bddef10e0690)

- **Server Category Boxes**  
- Each category displays its name, number of servers and number of players online
- Clickable boxes for each category of servers, current categories are:
  - Deathmatch
  - Retake
  - 5v5
  - Surf
  - Bhop
- When clicked only servers from the chosen category are displayed

- **Premium Servers**  
- Premium Servers are servers with VIP Access and show up at the top of the page (Paid)
  
- **Community Servers**  
- Community Servers show up below the VIP ones
- Server positions are based on rating (currently in development)

- **Server Info** 
Servers display the following:
  - country
  - server name
  - IP (copy on click)
  - Map (real time updates)
  - Gamemode
  - Players (real time updates)
  - Action - join button, like button, report button and expand button (currently in development)
  
Extra details are shown when expanded:
  - Server banner (Currently availabe for both, possibly a paid feature on release)
  - Description
  - Tags
  - Registered by (currently in development)

### Additional Features:
- Google search integration
- Theme presets
- Config import/export
- Github commit checker


### 2. My Servers

![My Servers](https://github.com/user-attachments/assets/3ecfe576-8f68-4c3e-a9d1-8e161ba4365a)

- **Add Server Button** 

![Adding Servers](https://github.com/user-attachments/assets/e496c413-848d-41d8-8164-0e96a40d62bf)

- Allows users to add servers and requires them to give the following information required for server registration:
  - Name
  - IP Address
  - Port
  - Description
  - Country
  - Game (CSGO/CS2)
  - Prime Status (Y/N)
  - Tags (comma separated)
  - Server Banner (image/gif)
  - Gamemode

- **My Servers List**  
- A list of all added servers by the user is shown (if any exist)
- Basic server information is shown including:
  - Server Name
  - IP Address
  - Port
  - Country
  - Game
  - Prime Status
  - Banner 
  - Actions to modify server information (Edit/Delete)


### 3. Options (Currently in development)

### 4. Daily Clip (Currently in development)

### 5. VIP Acess (Payments Page) (Currently in development)

### 6. Staff Page (Currently in development)


---

### TO-DO:

- **All Pages**
- Add ad spaces where missing
- Optimize for speed and efficiency where possible
- **Nav Bar**
- Search bar should allow players to search servers up using IP addresses, tags, names etc.
- Placeholder filter button should either be removed or put to use (currently the category buttons filter servers, users won't need it on other pages)
- Extra stats bar could include something else other than the placeholder player ping (currently shows live servers and live players)  
- Small visual improvements in the small modals which come out of the profile icon (ones which display Settings and Login/Log out/Register)
- Captcha on register
- **Servers Page**
- Make join button use cs2 client to autojoin the match as opposed to copy pasting the ip every time  
- Servers currently have placeholder icons - those can be turned into profile pictures
- Like button needs to be fixed to add likes and show as active if already liked
- Report button needs to be added and reports need to be sent to a staff page (same page where clips are moderated)
- **My Servers Page**
- Captcha on server add
- Fix duplicate servers - shouldn't be allowed
- Only premium servers should be allowed to add banners
- **Options Page**  
- Options need to be added so users can personalize their experience
- Options page could just be a modal (part of the Settings mentioned earlier in the nav bar)
- **Daily Clip Page**  
- Users need to be given a button to send clips to a queue
- Clips from Playlist queue need to be set to be displayed each day with the following information:
  - Clip Link
  - User who submitted the clip
- **VIP Access Purchasing Page**  
- Payment plans should be clearly outlined
- Payment gateways should be deployed
- **Daily Clip STAFF Page**  
- When clips are added to the queue the staff members should manually be able to approve clips
- Once approved they should go to the Playlist queue mentioed before
- Staff should be able to remove clips or edit them through a basic UI in case mistakes happen (e.g. clip gets approved by accident)

### Optional tasks and previous ideas:

- autochecks for things like 5v5 category cant have a server where the max is 64 players  
- minigames r/place, skin float guessr, daily challenges can be added towards the end  
- display map by showing images
- create more splashes for the info boxes that fit the themes e.g. a surf themed splash   
- show user ping relative to each server 
- include player profile preview of those that are connected to the server including faceit rank
- include server player statistics such as graphs which show the number of players over time
