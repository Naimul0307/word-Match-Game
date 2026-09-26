document.addEventListener("DOMContentLoaded", function () {

    const enterButton = document.getElementById("enter-btn");

    if (!enterButton) {
        return;
    }

    enterButton.addEventListener("click", function () {
        window.location.href = "user.html";
    });

});
