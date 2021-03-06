let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

let fullname = document.getElementById("fullname");
let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("password");
let psw_repeat = document.getElementById("psw-repeat");

let errors = document.getElementsByClassName("signuperror");

//check inputs when submit button is clicked
function validate(){
    for(let i = 0; i<errors.length; i++){
        if(errors[i].style.display="inline"){
            errors[i].style.display ="none";}
    }

    if(fullname.value.length<5){
        errors[0].style.display ="inline";
        return false;
    }else if(username.value.length<3){
        errors[1].style.display ="inline";
        return false;
    }else if(!email.value.match(mailformat)){
        errors[2].style.display ="inline";
        return false;
    }else if(password.value.length<8){
        errors[3].style.display ="inline";
        return false;
    }else if(password.value != psw_repeat.value){
        errors[4].style.display ="inline";
        return false;
    }else{
        return true;
    }
}

//check inputs as user types
fullname.onkeyup = function(){
    if(fullname.value.length<5){
        errors[0].style.display ="inline";
    }else{errors[0].style.display="none";}
}

username.onkeyup = function(){
    if(username.value.length<3){
        errors[1].style.display ="inline";
    }else{errors[1].style.display ="none";}
}

email.onkeyup = function(){
    if(!email.value.match(mailformat)){
        errors[2].style.display ="inline";
    }else{errors[2].style.display ="none";}
}

password.onkeyup = function(){
    if(password.value.length<8){
        errors[3].style.display ="inline";
    }else{errors[3].style.display ="none";}
}

psw_repeat.onkeyup = function(){
    if(password.value != psw_repeat.value){
        errors[4].style.display ="inline";
    }else{errors[4].style.display ="none";}
}



