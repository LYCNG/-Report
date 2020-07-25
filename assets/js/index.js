//
function myload() {
    $(".loader-mask").fadeOut(1000);
}
$(window).on("load", myload);

function btnact(element){
    element.className='btn btn-primary btn-block';
}

function btnre(element){
    element.className='btn btn-info btn-block';
};
//nav字形變色
$(".nav-link").on("mouseenter",function(){
    $(this).css("color","red")
})
$(".nav-link").on("mouseleave",function(){
    $(this).css("color","white")
})

function logcheck(){
    const logoutform = document.getElementById('outlog')  
    const inlog = document.getElementById('inlog')
    let params = (new URL(document.location)).searchParams;
    if(params.get("id")){
        logoutform.style.display="inline"
        inlog.style.display = 'none';
    }else{
        logoutform.style.display="none"
        inlog.style.display = 'inline';
    }
}
//user page按鈕show or hidden
$("svg").on("click",function(){
    $("#userpage").toggleClass("slidePage")
})

$("svg").on("click",function(){
    $(".btn1").toggleClass("slidebtn")
})

function checkhealth(){
    var hp= document.getElementById("remainder").text
    var damage = document.getElementById("damage").value
    if(damage > parseInt(hp)){
        alert("超過王剩餘血量")
        document.getElementById('damage').value = 0
    }
};

function checkweek(){
    var currentweek = document.getElementById('getweek').text;
    var inputweek = document.getElementById('week').value;
    if(inputweek != parseInt(currentweek)){
        alert("非當前周次")
        document.getElementById('week').value = currentweek
    }
}
