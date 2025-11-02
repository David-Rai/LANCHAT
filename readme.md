# 💬 LanChat

**LanChat** is a local-area-network (LAN) based chat app that lets users **chat and share files** within the same network — no internet required!  
It’s lightweight, fast, and great for offices, classrooms, or home networks.

---

##  Features

-  Real-time **text chatting** via Socket.IO  
-  **File sharing** (upload & download in LAN)  
-  Connect using **LAN IP (no public internet)**  
-  Automatic notification on **new file uploads**,**new user join or leave**  
-  Simple codebase — great for learning Express + Socket.IO + React

---

## Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend** | React.js + Socket.IO Client |
| **Backend** | Node.js + Express.js + Socket.IO |
| **File Handling** | Multer |
| **Transport** | WebSockets + HTTP |

---

##  Requirements

- Node.js v14+  
- npm or yarn  
- All devices must be on the **same LAN**  

---


### 1️ Clone the repository

```bash
git clone https://github.com/david-rai/lanchat.git
cd lanchat
```

## 2 Install the dependencies
```bash
cd chat-app
npm install 
npm run dev

cd..
cd chat-app-server
npm install 
node index.js
```

## 3. Getting your IPV4
- Inside powershell
```bash
ipconfig
```
## 4. Configuration
- Inside **config.js**
```bash
export let IP='192.168.1.12'//your IPV4
export let PORT=1111 // Suitable port
```



