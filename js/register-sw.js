if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try{

            const reg=await navigator.serviceWorker.register("./sw.js");

            reg.update();

            console.log("Service Worker aktif");

        }

        catch(err){

            console.log(err);

        }

    });

}