function initialize() {
    // Initialization code here
}

function updateUI(data) {
    // Code to update the UI with the provided data
}

function fetchData() {
    // Mock API response for testing purposes
    return new Promise((resolve) => {
        const mockData = { /* mock data structure */ };
        resolve(mockData);
    });

    // Uncomment the following code to use a real API
    // return fetch('api/data')
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.json().catch(() => {
    //             throw new Error('Invalid JSON response');
    //         });
}

function refreshData() {
    fetchData().then(data => {
        updateUI(data);
    }).catch(error => {
        console.error('Error fetching data:', error);
        // Handle error, e.g., show a message to the user
    });
}

let streaming = false;
let streamTimeout;

function getIpAddress() {
    const ipAddressInput = document.getElementById('ipAddressInput').value;
    if (ipAddressInput) {
        return ipAddressInput;
    } else {
        try {
            const guessedIp = location.hostname;
            return guessedIp || '127.0.0.1';
        } catch (error) {
            return '127.0.0.1';
        }
    }
}

function streamCommandsToWLED(wledJSON) {
    const endpoint = `http://${getIpAddress()}/json/state`;
    const segments = wledJSON.seg;
    let index = 0;
    const duration = parseInt(document.getElementById('durationInput').value, 10) || 300;
    const loop = document.getElementById('loopCheckbox').checked;

    function sendNextCommand() {
        if (index < segments.length && streaming) {
            const command = { seg: [segments[index]] };
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(command)
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(() => {
                index++;
                if (index >= segments.length && loop) {
                    index = 0;
                }
                streamTimeout = setTimeout(sendNextCommand, duration);
            }).catch(error => {
                console.error('Error sending command:', error);
            });
        }
    }

    streaming = true;
    sendNextCommand();
}

function streamCommandsToWLEDReverse(wledJSON) {
    const endpoint = `http://${getIpAddress()}/json/state`;
    const segments = wledJSON.seg;
    let index = segments.length - 1;
    const duration = parseInt(document.getElementById('durationInput').value, 10) || 300;
    const loop = document.getElementById('loopCheckbox').checked;

    function sendNextCommand() {
        if (index >= 0 && streaming) {
            const command = { seg: [segments[index]] };
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(command)
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(() => {
                index--;
                if (index < 0 && loop) {
                    index = segments.length - 1;
                }
                streamTimeout = setTimeout(sendNextCommand, duration);
            }).catch(error => {
                console.error('Error sending command:', error);
            });
        }
    }

    streaming = true;
    sendNextCommand();
}

function streamCommandsToWLEDShuffle(wledJSON) {
    const endpoint = `http://${getIpAddress()}/json/state`;
    const segments = wledJSON.seg;
    const duration = parseInt(document.getElementById('durationInput').value, 10) || 300;
    const loop = document.getElementById('loopCheckbox').checked;
    let remainingIndices = Array.from({ length: segments.length }, (_, i) => i);

    function sendNextCommand() {
        if (remainingIndices.length > 0 && streaming) {
            const randomIndex = Math.floor(Math.random() * remainingIndices.length);
            const index = remainingIndices.splice(randomIndex, 1)[0];
            const command = { seg: [segments[index]] };
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(command)
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(() => {
                if (remainingIndices.length === 0 && loop) {
                    remainingIndices = Array.from({ length: segments.length }, (_, i) => i);
                }
                streamTimeout = setTimeout(sendNextCommand, duration);
            }).catch(error => {
                console.error('Error sending command:', error);
            });
        }
    }

    streaming = true;
    sendNextCommand();
}

function stopStreaming() {
    streaming = false;
    clearTimeout(streamTimeout);
}

function switchTheme(theme) {
    document.body.className = theme;
    document.getElementById('container').className = `container ${theme}`;
    document.getElementById('controlsContainer').className = `loop-checkbox-container ${theme}`;
    document.querySelector('.theme-selector-container').className = `theme-selector-container ${theme}`;
    document.querySelectorAll('button').forEach(button => {
        button.className = theme;
    });
}

function bindEvents() {
    document.getElementById('ingestButton').addEventListener('click', () => {
        testIngestImage();
        refreshData(); // Call refreshData when the "Load Image" button is clicked
    });
    document.getElementById('startStreamingButton').addEventListener('click', () => {
        const wledJSON = JSON.parse(document.getElementById('output').textContent);
        const playMode = document.querySelector('input[name="playMode"]:checked').value;
        if (playMode === 'forward') {
            streamCommandsToWLED(wledJSON);
        } else if (playMode === 'reverse') {
            streamCommandsToWLEDReverse(wledJSON);
        } else if (playMode === 'shuffle') {
            streamCommandsToWLEDShuffle(wledJSON);
        }
        refreshData(); // Call refreshData when the "Play" button is clicked
    });
    document.getElementById('stopStreamingButton').addEventListener('click', () => {
        stopStreaming();
        refreshData(); // Call refreshData when the "Stop Streaming" button is clicked
    });
    document.getElementById('themeSelector').addEventListener('change', (event) => {
        switchTheme(event.target.value);
        refreshData(); // Call refreshData when the theme is changed
    });
}

// Call initialize and bindEvents on page load
document.addEventListener('DOMContentLoaded', () => {
    initialize();
    bindEvents();
    refreshData();
    switchTheme(document.getElementById('themeSelector').value);
});

function mapPixelArrayToWLEDJSON(pixelArray, width) {
    const segments = [];
    for (let i = 0; i < pixelArray.length; i += width) {
        const segment = { i: [] };
        for (let j = 0; j < width; j++) {
            const [r, g, b] = pixelArray[i + j];
            const hexColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
            segment.i.push(j, hexColor);
        }
        segments.push(segment);
    }
    return { seg: segments };
}

function ingestImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const pixelArray = [];
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    pixelArray.push([r, g, b]);
                }
                const wledJSON = mapPixelArrayToWLEDJSON(pixelArray, img.width);
                resolve(wledJSON);
            };
            img.src = event.target.result;
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

function testIngestImage() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/gif, image/jpeg, image/bmp, image/webp';
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            ingestImage(file).then(wledJSON => {
                console.log(wledJSON);
                displayOutput(wledJSON);
                streamCommandsToWLED(wledJSON);
            }).catch(error => {
                console.error('Error ingesting image:', error);
            });
        }
    };
    fileInput.click();
}

function displayOutput(wledJSON) {
    const outputElement = document.getElementById('output');
    outputElement.textContent = JSON.stringify(wledJSON, null, 2);
}
