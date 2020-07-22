const socket=io()

const $messageForm= document.querySelector("#message-form")
const $messageFormInput=$messageForm.querySelector("#message")
const $messageFormButton=$messageForm.querySelector("#sendChat")

const $locationButton=document.querySelector("#sendLocation")
const $messages=document.querySelector("#messages")
const messagetemplate=document.querySelector("#message-template").innerHTML

const locationtemplate=document.querySelector("#location-template").innerHTML

const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{

    const $newMessage=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)

    const newMessageMargin=parseInt(newMessageStyles.marginBottom)

    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }



    console.log(newMessageMargin)

}

socket.on("locationMessage",(message)=>{
    console.log(message)
    const html=Mustache.render(locationtemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()

})


socket.on("message",(message)=>{
    console.log(message)
    const html=Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on("roomData",({room,users})=>{
    console.log(room)
    console.log(users)
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    
    $messageFormButton.setAttribute("disabled","disabled")
    const message=$messageFormInput.value
    
    socket.emit("sendMessage",message,(error)=>{
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value=""
        $messageFormInput.focus()
        if(error){
           return console.log(error)
        }
        console.log("message is delivered")
    })

})

$locationButton.addEventListener("click",()=>{
    
    if(!navigator.geolocation){
        return alert("geolocation is not supported by your browser")
    }

    $locationButton.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendLocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log("location is shared!")
            $locationButton.removeAttribute("disabled")
        })
    })

})

socket.emit("join",{username,room},(error)=>{
if(error){
    alert(error)
    location.href="/"
}
})