# wled-metatron
An IMG2FX LED Pixel Streamer for WLED 

# WLED Metatron WebUI Application

## Description
The WLED Metatron WebUI Application is a web-based interface designed to control WLED devices. It allows users to load images, convert them into WLED-compatible JSON, and stream commands to the WLED device in various modes (forward, reverse, shuffle). The application also supports theme switching and provides a user-friendly interface for interacting with WLED devices.

## Functionality
- **Load Image**: Ingest an image file and convert it into a WLED-compatible JSON format.
- **Play Modes**: Stream commands to the WLED device in forward, reverse, or shuffle mode.
- **Theme Switching**: Change the application's theme to Light Mode Solarized, Dark Mode Solarized, or Color Blind Friendly.
- **IP Address Input**: Specify the IP address of the WLED device.
- **Looping**: Enable or disable looping of the command stream.
- **Time Between Frames**: Set the duration between frames in milliseconds.

## Methodology
1. **Ingest Image**: The application reads an image file, extracts pixel data, and maps it to a WLED-compatible JSON format.
2. **Stream Commands**: The application sends commands to the WLED device based on the selected play mode and duration between frames.
3. **Theme Switching**: The application updates the UI theme based on user selection.

## Installation Methods

### 1. Installed to WLED Device
To install the application directly to a WLED device, follow these steps:
1. Open the WLED web interface and navigate to the "Edit" page (`http://wled.host.name/edit`).
2. Upload the following files:
   - `metatron.htm`
   - `metatron.css`
   - `metatron.js`
3. Access the application by navigating to `http://wled.host.name/metatron.htm`.

### 2. Installed to Local Server or Raspberry Pi
To install the application on a local server or Raspberry Pi using `lighttpd` or `Apache`, follow these steps:
1. Copy the following files to the server's web directory:
   - `metatron.htm`
   - `metatron.css`
   - `metatron.js`
2. Configure the server to serve these files.
3. Access the application by navigating to the server's URL (e.g., `http://localhost/metatron.htm`).

### 3. Running from a Local Browser
To run the application directly from a local browser, follow these steps:
1. Open the `metatron.htm` file with your favorite browser (Chromium is recommended for development).
2. The application will load and be ready for use.

## License
This project is released under the MIT License.
