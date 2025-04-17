// Function to change the profile picture
function changeProfilePic() {
    document.getElementById('profilePicInput').click();
}

// Handle profile picture upload
document.getElementById('profilePicInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePic').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Function to edit profile details
function editProfile() {
    let newName = prompt("Enter your new name:", document.getElementById('userName').innerText);
    let newEmail = prompt("Enter your new email:", document.getElementById('userEmail').innerText);
    let newPhone = prompt("Enter your new phone number:", document.getElementById('userPhone').innerText);
    let newBio = prompt("Enter your new bio:", document.getElementById('userBio').innerText);

    if (newName) document.getElementById('userName').innerText = newName;
    if (newEmail) document.getElementById('userEmail').innerText = newEmail;
    if (newPhone) document.getElementById('userPhone').innerText = newPhone;
    if (newBio) document.getElementById('userBio').innerText = newBio;
}
