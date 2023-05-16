// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

//-------------------------------------------------------------------------------------

//image upload
const uploadContainer = document.querySelector('.upload-container');
const previewContainer = document.querySelector('#preview-container');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    });
});

// Highlight drop area when item is dragged over
['dragenter', 'dragover'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, e => {
        uploadContainer.classList.add('highlight');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, e => {
        uploadContainer.classList.remove('highlight');
    });
});

// Handle dropped files
uploadContainer.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Handle selected files
document.querySelector('#file-upload').addEventListener('change', e => {
    const files = e.target.files;
    handleFiles(files);
});

const imageFiles = [];
function handleFiles(files) {

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => {
                const image = new Image();
                image.src = e.target.result;
                image.addEventListener('load', () => {
                    const previewImage = document.createElement('div');
                    previewImage.classList.add('preview-image');
                    previewImage.innerHTML = `
                <img src="${image.src}">
                <button class="cancel-btn">x</button>
              `;
                    /*   <div class="image-tag">${file.name}</div>*/

                    previewContainer.appendChild(previewImage);
                    const cancelButton = previewImage.querySelector('.cancel-btn');
                    cancelButton.addEventListener('click', () => {
                        // Remove the image file from the array
                        const index = imageFiles.indexOf(file);
                        if (index > -1) {
                            imageFiles.splice(index, 1);
                        }
                        // Remove the preview image from the DOM
                        previewImage.remove();
                        console.log(imageFiles);
                    });

                    // Append the image file to the array
                    imageFiles.push(file);
                    console.log(imageFiles);
                });
            };
            reader.readAsDataURL(file);
        }
    }
}



//------------------
$("#submitsharestory").click(function (e) {

    e.preventDefault();

    const formData = new FormData();

    for (let i = 0; i < imageFiles.length; i++) {
        //images.push(imageFiles[i]);
        formData.append('Images', imageFiles[i]);
    }
    if (imageFiles.length === 0) {
        alert("upload atleast one image")
        $("#uploadvalidate").addClass("validatefield");
        return false;
    }
    else {
        $("#uploadvalidate").removeClass("validatefield");
    }

    $.ajax({
        type: "POST",
        url: "/Home/Storydatasave",
        processData: false,
        contentType: false,
        data: formData,
        success: function () {
            alert("story saved successfully!");
            imageFiles = [];
            return false;
        },
        error: function () {
            alert("Fill proper data!");
        }
    });
});


//----------Draft--------
$("#Draftbtn").click(function (e) {

    e.preventDefault();
    imageFiles.splice(0, imageFiles.length);
    $.ajax({
        type: "POST",
        url: "/Home/Draftdata",
        success: function (result) {
            if (result.success) {
                var data = result.data;
                var imagerecords = data.imgdata;

                // Clear any existing preview images
                previewContainer.innerHTML = '';
                imagerecords.forEach((media, index) => {
                    fetch('/Images/MissionImages/' + media)
                        .then(response => response.blob())
                        .then(blob => {
                            // create a new File object from the image file
                            const file = new File([blob], media, { type: blob.type });
                            // add the file to the imageFiles array
                            imageFiles.push(file);
                            console.log(imageFiles);
                            // Create a new div element to contain the image and cancel icon
                            const previewItem = document.createElement('div');
                            previewItem.classList.add('preview-item');
                            previewItem.style.position = 'relative';
                            previewItem.style.display = 'inline-block';

                            // Create a new img element for the image file and append it to the preview item    
                            const img = document.createElement('img');
                            img.src = URL.createObjectURL(blob);
                            img.classList.add('imagestyle');

                            previewItem.appendChild(img);

                            // Create a new button element for the cancel icon and append it to the preview item
                            const cancelButton = document.createElement('button');
                            cancelButton.classList.add('cancel-btn2');
                            cancelButton.innerHTML = 'x';
                            previewItem.appendChild(cancelButton);

                            // Append the preview item to the preview container
                            previewContainer.appendChild(previewItem);

                            // Add an event listener to the cancel button to remove the image file and preview item
                            cancelButton.addEventListener('click', () => {
                                // Remove the image file from the array
                                const index = imageFiles.indexOf(file);
                                if (index > -1) {
                                    imageFiles.splice(index, 1);
                                }
                                // Remove the preview item from the DOM
                                previewItem.remove();
                                console.log(imageFiles);
                            });
                        });
                });

            }

        },
        error: function () {
            console.log("error");
            alert("Fill proper data!");
        },
    })
});


// rating

const rating = document.getElementById("rating");

$('#rating').on('change', function () {
    var user_rating = $(this).find('input:checked').val();

    console.log(user_rating);
    $(this).find('input:checked').nextAll('label').addClass('filled');
    $(this).find('input:checked').prevAll('label').removeClass('filled');

    $.ajax({
        type: "POST",
        url: "/Home/UserRating",
        data: { userRating: user_rating },
        success: function (result) {
            if (result.success) {
                var data = result.data;
                console.log(data.userRating);
            }
        },
        error: function () {
            console.log("error");
        },
    });
});
