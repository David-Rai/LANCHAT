const express=require('express')
const http=require("http")
const {Server}=require('socket.io')
const cors=require("cors")
require("dotenv").config()

const app=express()
const server=http.createServer(app)
const io=new Server(server,{
    cors:{
 origin: '*'
    }
})

app.use(cors())

//web sockets
const roomName="chat-room"
io.on("connection",client=>{
    console.log('new client',client.id)

    //Getting the name and joining the room
    client.on("name",async (name)=>{
        client.username=name
        client.join(roomName)
       client.to(roomName).emit('join-message',`${name} joined`)
    })

    //Getting the message form client along with the username
    client.on("send-message",async ({message,name})=>{
        console.log(`New messagge from ${name} that is ${message}`)
        io.to(roomName).emit("message",{message:message,sender_id:client.id,sender_name:name})
    })

    //sending the message on disconnect
    client.on('disconnect',async ()=>{
        // const deletedUser=await userModel.findOneAndDelete({user_id:client.id})
        io.to(roomName).emit("leave-message",client.username)
    })
    
})

      //Routes for routing
app.get('/',(req,res)=>{
    res.send("home page ho hai")
})

const port=1111
server.listen(port,()=> console.log("server is live"))



