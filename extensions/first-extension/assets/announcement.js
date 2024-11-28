// const shopUrl = '{{ shop.domain }}';


console.log(window.shopUrl.split("//")[1]);
const shopUrl = window.shopUrl.split("//")[1]

// You can now use the shopUrl to conditionally load announcement text or make requests to your backend
// console.log(shopUrl); // For debugging purposes

// Example of how you can fetch the announcement text dynamically based on shop URL
async function fetchAnnouncementText() {
    // const response = await fetch(`http://localhost:3000/api/get-announcement-text?shopUrl=${shopUrl}`);
    const response = await fetch(`http://localhost:8002/api/announcement?shopUrl=${shopUrl}`);
    const data = await response.json();
    console.log(data.announcementData);


    if (data?.announcementData?.data) {
        // Update the announcement text dynamically (in case you want to fetch it from a backend)
        const announcementText = data?.announcementData?.data?.announcementText;
        const backgroundColor = data?.announcementData?.data?.backgroundColor;
        const textColor = data?.announcementData?.data?.textColor;
        const action = data?.announcementData?.data?.action;
        const buttonText = data?.announcementData?.data?.buttonText;
        const selectedPageForBar = data?.announcementData?.data?.selectedPageForBar;
        const selectedCollections = data?.announcementData?.data?.selectedCollections;
        const announcementDiv = document.querySelector('.announcement-head')
        const announcementBar = document.querySelector('.main')
        const collectionId = announcementDiv.textContent

        if (selectedPageForBar == announcementDiv.id || (selectedPageForBar === "everyPage")) {

            if (selectedPageForBar == 'collection' && selectedCollections == collectionId) {

                announcementBar.style.display = "block"
            }
            else
                announcementBar.style.display = "block"

        }



        // Check if the response contains a new announcement text and apply it
        if (announcementText) {
            document.querySelector('.announcement-bar__message span').textContent = announcementText;
        }

        // Check if a background color is provided, and apply it to the announcement bar
        if (backgroundColor) {
            document.querySelector('.announcement-bar').style.backgroundColor = backgroundColor;
        }

        // Check if a text color is provided, and apply it to the announcement text
        if (textColor) {
            document.querySelector('.announcement-bar__message span').style.color = textColor;
        }
        if (action === "Button") {
            // const textSpan = document.querySelector('.announcement-bar__message span')
            // const btnSpan = document.createElement('span');
            // const btn = document.createElement("button")
            // btn.innerHTML = buttonText ?? "Shop!!"
            // btnSpan.innerHTML = btn
            // textSpan.appendChild(btnSpan)

            const textSpan = document.querySelector('.announcement-bar__message span');

            const btn = document.createElement("button");
            btn.innerHTML = buttonText ?? "Shop!!";

            textSpan.appendChild(btn);
            btn.style.padding = "4px"
            btn.style.marginLeft = "10px"
            btn.style.borderRadius = "4px"


        }
    }
}

// Call the fetch function if needed
fetchAnnouncementText();